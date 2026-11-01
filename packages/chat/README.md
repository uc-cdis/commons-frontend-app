# @gen3/chat: Genomics Explorer

`@gen3/chat` is Genomics Explorer, the chat feature of the portal. The portal (`apps/commons`) shows it on the `/Chat` page. You ask a question about GDC data, and an AI agent answers. It uses tools to look up cohorts, mutations, expression and survival.

This file describes how the chat works today. The move from the old QAG agent to the GDC agent is still in progress; the [Work in progress](#work-in-progress) table shows which parts are done.

## The big picture

```
 browser (/Chat page)
   │  POST /chat-runtime  (your login cookie goes along)
   ▼
 portal server (Next.js)            @gen3/chat/server
   │  checks your login, then forwards the request with your token
   │  POST <GEN3_AGENT_BASE_URL>/agui/
   ▼
 gdc-agent (pydantic-ai)            repo: gdc-mcp-demo/agent
   │  picks tools and calls them
   ▼
 gdc-mcp (MCP server)               repo: gdc-mcp-demo/gdc_mcp
   │
   ▼
 GDC API
```

- The browser never talks to the agent directly. Only the portal server does.
- Answers stream back as **AG-UI events**: text, reasoning, tool calls, tool results, then "run finished".
- **CopilotKit** is the library that sends those events through the portal and into React.

## Where the code lives

```
packages/chat/src/
  core/     no UI: hooks, saving chats, talking to the agent
  ui/       the screens, built with Mantine
  server/   handlers for the portal's chat and download routes
apps/commons/
  src/pages/Chat.tsx              the /Chat page
  src/pages/api/chat-runtime.ts   wires the chat handler to the portal's login check and agent url
  src/pages/api/chat-download/    the same for downloads
  src/lib/chat/                   the login check (auth.ts) and the agent url (agent.ts)
```

Rule: `apps/commons` uses `@gen3/chat`. `@gen3/chat` never imports from the app.

## What happens when you ask a question

```
you press Send
  1. your question is saved in the browser
  2. the agent works, and the screen updates as events arrive:
       reasoning      "Thinking..." (only if the model shares its thoughts)
       a short reason "Looking up the field for lung cancer."
       a tool call    search_fields  Completed
       ... more reasons and tool calls ...
       the answer     "About 5.43% of lung cancer cases ..."
  3. the run finishes with "success", so the whole chat is saved again
```

If your question is unclear (for example, "mutations" could mean SSM or CNV), the agent asks you first. That question is a normal answer, and you reply with a normal message.

## What you see

- **Example questions** on the empty screen. Click one to send it.
- **Answers** in Markdown, with tables and math.
- **Reasoning**, when the model shares it: open while it thinks, then folded under "Thought for Xs". A click opens or closes it.
- **Steps**: before each tool call the agent writes one short reason. It shows in smaller grey text, above the tool panels it explains.
- **The final answer** shows in a card, with a Copy button under it once it has finished. With the new agent, the model's last step is a `final_result` call holding one sentence, which the agent checks and may send back for a rewrite; the agent then builds the answer from the tool results and sends it as a text message. `toChatMessage` hides `final_result`, so only that message shows. Its first line, the one sentence in bold, shows in navy. Copy puts the answer's Markdown on the clipboard, with download links made absolute so they still work when pasted.
- **One panel per tool call**: the tool name, how long it took, and a status:
  - ✓: the tool returned a result (a tick, so only problems show a coloured pill)
  - Error: the tool failed, or it got bad arguments and the agent will retry. No card shows under it.
  - Running: still running
  - No result: the run ended without a result for this call

  Click a panel to see its inputs (ARGUMENTS) and its output (RESULT, or ERROR), with JSON in colour. Calls to one tool that the agent makes together in one step share a row, such as "search_fields ×4"; its status is the worst of its calls ("1 error"), and it opens to its calls as numbered rows under it, each named by its arguments (`query: TCGA-CHOL`). Tools with a card are never grouped. pydantic-ai marks a failed call in a separate event after its result; `toChatMessage` in `core/utils.ts` reads it.

- **Download links** in answers (a file manifest as TSV, a cohort filter as JSON, a survival curve as JSON or CSV). A link on its own line, as the new agent writes them, shows as a download button with the link's text; a link inside a sentence stays a link (`ui/messages/markdownParagraph.ts`). Clicking either saves the file and keeps you on the chat page. The agent keeps each file for about 3 hours after it was last used. After that the link fails, and you ask again.
- **A survival card** under `get_survival_data`: the curve, the number of donors and the yearly survival estimates, joined to its tool call. Once the curve has expired, the card says so; ask again.
- **Downloads live in the answer.** The new agent links every file under the result it belongs to, so the cards don't repeat them. `CARD_DOWNLOADS` in `ui/tools/downloads.ts` switches that: `true` brings back a filter card under `create_filter` (Download JSON), a manifest card under `get_file_manifest` (Download TSV) and the survival card's Download JSON and CSV. Turn it on if the chat goes back to the old agent, whose answers carry links only when the model writes them. With it off, a run that ends without an answer (Stop, or an error) offers no download.
- **A header** with the open chat's title, as "Chat / title". Its menu renames or deletes the chat. The model picker is commented out in `ui/ChatHeader.tsx` while the agent offers one model; the names in `core/models.ts` must match the agent's `model-config.yaml` exactly.
- **A sidebar** with your chats, newest first, grouped into recent sessions (today), yesterday and earlier. You can search them by title, start a new chat, rename one, or delete one. You can't delete the chat that is running, and the other chats wait until it ends or you press Stop. A search always keeps the open chat in the list. On a computer, the arrow at its top folds it into a thin strip (new chat, search) and back; the browser remembers which. On a phone, the menu button opens it.
- **A "Scroll to latest" button**, centred at the bottom of the chat, when you scroll up while an answer streams.
- **An error banner**, "Something went wrong. Please try again." The details are in the browser console, as `[chat-core:<source>]`.

## Stop, Retry and Edit

```
you press Stop
  → the agent stops
  → the half-finished answer is removed from the screen
  → "You stopped this response." shows under your question
  → Retry and Edit appear under your question
```

- **Retry** runs your last question again.
- **Edit** lets you change your last question, then runs it.
- Both are offered only when nothing is running and your question is the last message.

## What is saved

Chats are saved **in your browser only** (IndexedDB), in a database called `gdc-chat`. Nothing is saved on a server, so a chat does not follow you to another browser or computer.

| Table      | One row per chat | Holds                                                                           |
| ---------- | ---------------- | ------------------------------------------------------------------------------- |
| `chats`    | yes              | id, title, created and updated times                                            |
| `messages` | yes              | the whole conversation: questions, reasoning, tool calls, tool results, answers |

The title is your first question, until you rename it. A question longer than 80 characters is cut at its last whole word and ends in "…".

**The rule: save only your questions and finished answers.**

| How a turn ends                   | What happens                                                       |
| --------------------------------- | ------------------------------------------------------------------ |
| You press Send                    | Your question is saved                                             |
| The run finishes with "success"   | The whole chat is saved                                            |
| You press Stop                    | The half answer is dropped, so the chat goes back to your question |
| An error, or the connection drops | Same as Stop, plus the error banner                                |

Why: the agent rebuilds its memory from the chat we send with every new question. A half-finished turn, such as a tool call with no result, can make the next question fail.

Old chats from the previous agent (QAG) are still in your browser, in a database called `QAG-chat`. The app no longer reads it, and nothing deletes it.

## Login and security

- `/Chat` needs a login (`config/gen3/authz.json`).
- Every chat request is checked on the portal server. Without a valid login it gets a 401.
- The server passes your token on to the agent.
- Downloads go through the portal too: `/download/<kind>/<handle>` → `pages/api/chat-download` → the agent. They need a login, and the portal checks each link before asking the agent (`core/downloadLinks.ts`).
  - Known limits: this needs the revproxy to keep sending `/download/*` to the portal (it does today). It breaks if the portal gets a `BASE_PATH`, or if the agent runs with `--root-path`, because the agent's links then start with that path.
- CopilotKit's usage telemetry is turned off (`COPILOTKIT_TELEMETRY_DISABLED=true`).

## Settings

| Variable                        | Where                         | What it does                                                                            |
| ------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| `GEN3_AGENT_BASE_URL`           | `apps/commons/.env.*` or helm | Base URL of the agent. Production: `http://gdc-agent` (inside the cluster)              |
| `COPILOTKIT_TELEMETRY_DISABLED` | `apps/commons/.env.*`         | `true` turns off CopilotKit's usage data. One setting covers the server and the browser |

## Colours

Chat colours are CSS variables at the top of `src/styles.css`, and the chat uses them throughout. Plain white surfaces and the cards' outlines use Mantine's body and border colours, and the survival plot keeps GDC's own curve colours.

- The palette (`--chat-blue`, `--chat-orange`, `--chat-green`, `--chat-red`, `--chat-red-dark`) is the designer's, from Figma. To change a colour, change its hex there. The colours under it (navy, the tints, the Error pill's red, a grey for icons and placeholders, and a darker orange for JSON strings) are the portal theme's and the wireframes' until the designer names them.
- Components use the role variables (`--chat-title`, `--chat-value`, `--chat-error`, `--chat-error-strong`, `--chat-error-tint`, `--chat-muted`, `--chat-muted-tint`, `--chat-action`, `--chat-rule`, `--chat-panel`, `--chat-tint`, `--chat-tint-light`, `--chat-answer-line`, `--chat-success`, `--chat-success-tint`, `--chat-download`, `--chat-primary`, `--chat-tool-name`, `--chat-icon`, `--chat-guide`, `--chat-placeholder`, `--chat-accent`, and `--chat-json-*` for the JSON in tool panels), never a palette colour directly. `--chat-muted` replaces Mantine's "dimmed" grey and `--chat-placeholder` its placeholder grey; both are below the 4.5:1 contrast text needs. The portal is light-only (Mantine's default), so there are no dark-mode values. Check the contrast again when you change a colour.

## Running it locally

1. Dev talks to the deployed agent through `https://genomicaicommons.org/agent` (set in `apps/commons/.env.development`). To use an agent you run yourself, put `GEN3_AGENT_BASE_URL=http://localhost:8080` in `apps/commons/.env.development.local` (git ignores it).
2. Run `npm run dev`, then log in. It runs three processes: `chat` rebuilds the package's TypeScript, `css` copies its `styles.css` to `dist` on every save, and `app` is the portal.
3. Open `/Chat`. Add `?copilotInspector` to the URL to see the raw AG-UI events (dev only).

Before you push, run `npm run build`.

## Tests

- Run `npm test`. It runs the unit tests with vitest: the chat package's, then the portal app's (its chat login check). CI runs them on every push.
- Tests sit next to the code, as `src/**/<name>.test.ts`. `npm run typecheck` checks them, but they are left out of the built package.
- The rules for how a run ends (save it, drop it, clear the stop note) live in `core/runEndings.ts`. To change a rule, change it there and update `runEndings.test.ts`.

## Library versions

| Library                                         | Version           | Note                                   |
| ----------------------------------------------- | ----------------- | -------------------------------------- |
| `@copilotkit/react-core`, `@copilotkit/runtime` | 1.80.0            |                                        |
| `@ag-ui/client`                                 | **exactly 1.0.2** | must match the version CopilotKit pins |

When you upgrade CopilotKit, set `@ag-ui/client` to the version that CopilotKit pins, in both `package.json` files. Then check that `npm ls @ag-ui/client` shows a single version. Two copies break the chat in confusing ways.

React, Mantine, CopilotKit and AG-UI are **peer dependencies** of `@gen3/chat`: the app installs one shared copy. They hold shared state, so there must be only one copy.

## Known limits

- **One chat runs at a time.** While an answer runs, the other chats in the sidebar wait. The page has one live slot for the open chat, and the running answer is written into it. Switching chats mid-answer would put that answer into the wrong chat.
- **A reload mid-answer loses the answer on screen.** The portal keeps the agent working, but the reloaded page doesn't reconnect to it. Retry in that chat fails until the old run ends (up to about a minute). Start a New conversation instead.
- **The plan, after the demo:** give each chat its own agent, so an answer keeps running in the background while you read another chat. Then reconnect to a running answer after a reload, through CopilotKit's `connect`.

## Work in progress

The move from the old QAG agent to the GDC agent happens in phases:

| Phase | What changes                                                                                   | Status |
| ----- | ---------------------------------------------------------------------------------------------- | ------ |
| 0–2   | Point the chat at the new agent, upgrade the libraries, remove plan approval, new saving rules | done   |
| 2.5   | Unit tests for the saving and Stop rules; CI runs them                                         | done   |
| 3     | Remove the old "Run Summary" card                                                              | done   |
| 4     | Show each short reason _above_ its tool call                                                   | done   |
| 5     | Make download links in answers work, through a portal route                                    | done   |
| 6     | Survival card, manifest card and filter download for the new agent; chat colours               | done   |
| 7     | Named Genomics Explorer; new empty screen, composer and sidebar; the agent's example questions | done   |
| 7a    | Genomics Explorer in the nav bar; remove the Analysis page and its old AI tiles                | done   |
| 8     | Status pills, blue tool panels, sidebar fold and the last colours from the mockup              | done   |
| 8     | Steps list from the mockup; spacing                                                            | next   |
| Later | One agent per chat (background runs), then resume an answer after a reload                     | later  |

The model picker works only after the agent reads the chosen model from `forwardedProps.model`. That is a separate change in the agent repo.

## Words used here

| Word       | Meaning                                                       |
| ---------- | ------------------------------------------------------------- |
| Agent      | The AI program that answers (`gdc-agent`)                     |
| Run / turn | One question and everything the agent does to answer it       |
| Tool call  | The agent asking a tool for data, for example `get_ssm_cases` |
| Half turn  | A run that ended early: stopped, failed, or cut off           |
| AG-UI      | The event format between the agent and the chat               |
| CopilotKit | The library that carries AG-UI events into React              |
| MCP        | The protocol the agent uses to call GDC tools                 |
