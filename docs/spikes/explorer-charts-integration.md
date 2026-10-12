# Spike: integrating custom charts into the Explorer page

Framework: `@gen3/frontend` 0.12.69. Goal: replace the config-driven `charts` on each
Explorer tab with our own ECharts components, without the framework rendering its own.

## How the framework renders charts today

`ExplorerPage` → `CohortBuilder` (uncontrolled Mantine `Tabs`, `keepMounted`) → one
internal, non-exported `CohortPanel` per tab. `CohortPanel` owns:

- the per-tab `accessLevel` state (patched to `Accessibility.ACCESSIBLE` by
  `patches/@gen3+frontend+0.12.69.patch`), passed to every aggs/counts query;
- one `useGetAggsQuery({ fields: chartKeys, filterSelf: true, ... })` for all charts;
- rendering `<Charts>` between the downloads/counts row and the table.

There is no hook point between "fetch chart data" and "render `<Charts>`".

## Facts that apply to every route

- `useSetCohortFilters` / `useClearCohortFilters` do not exist in 0.12.69. The facet
  panels use `useUpdateFilters(index)` / `useClearFilters(index)` from
  `@gen3/frontend`; charts should use the same hooks so filters show up identically in
  the query expression and facet checkboxes (verified: a chart click ticks the facet).
- Every `@gen3/core` query hook defaults to `Accessibility.ALL`, but the Explorer queries
  with `ACCESSIBLE`. A chart that omits `accessibility` shows different numbers from
  the tab's own count.
- Logged out, `ACCESSIBLE` returns 0 records on every index; raw-record queries under
  `ALL` return 401. Under `ALL`, aggregations come back with small counts suppressed as
  `-1`. Charts have to treat `-1` as "suppressed", never as a value.
- `ReactECharts` (from `@gen3/frontend`) only rebinds `events` when `loading` changes,
  so handlers must read the latest state through a ref. It also hardcodes
  `role="figure" aria-label="Data Chart"`, so the chart frame has to provide the real label.

## Route A: patch `CohortPanel` with a chart-panel registry

Script: `docs/spikes/route-a-charts-registry-patch.mjs`. It adds `ExplorerChartsPanelFactory`
(a `RenderFactoryTypedInstance`, same as the two table factories). `CohortPanel` looks
up `('explorerCharts', index)`; if a renderer is registered it skips the built-in chart
aggregation and renders ours in the same slot, passing `index`, `charts` (from
`explorer.json`), `cohortFilters`, `accessibility`, `queryId`, `counts`, `numCols`.

- Size: 4 hunks × 2 bundles (esm + cjs chunk) + 2 `index.js` export maps + `index.d.ts`,
  so 5 files and about 60 lines. The bundles are not minified, so the patch is readable.
  CJS needs its own anchors because it uses namespaced hooks and `jsxRuntime.jsx`.
- All anchors are unique in the current bundles (checked read-only).
- **Not run in this spike.** Writing into `node_modules` (needed to generate the patch)
  was blocked in the agent session.
- On upgrade: chunk filenames are content-hashed, so the patch has to be re-made. That's
  already true for the existing patch. patch-package fails `npm install` loudly if a
  hunk doesn't apply. This is generic enough to offer upstream to uc-cdis.

## Route B: no patch, portal into each tab (spiked and working)

Code: `src/lib/charts/spike/PortalCharts.tsx` (~45 lines). It finds
`[role=tabpanel][id$="-panel-<tabTitle>"] #cohort-builder-content` and creates a mount
node after the downloads/counts row. A `createPortal` renders our panel there from
`src/pages/Explorer.tsx`. A `MutationObserver` re-attaches it if the framework
re-creates the subtree.

Verified in headless Chrome against the live API:
- The chart lands in the Donors tab's content column, exactly where the built-ins render.
- Tabs are `keepMounted`, so each tab has its own portal and no active-tab tracking is
  needed. Switching tabs hides and restores correctly.
- Clicking a bar → `useUpdateFilters` → cohort pill + facet checkbox update → the chart
  re-queries with the new cohort.

Costs: depends on three undocumented details (Mantine panel id suffix, the duplicated
`#cohort-builder-content` id, child order). If an upgrade changes any of them, the charts
silently disappear unless a smoke test catches it. It also can't see `CohortPanel`'s
`accessLevel` or `counts`, so it has to assume `ACCESSIBLE` and query counts itself.
The body-wide `MutationObserver` fires on every table re-render (cheap, but it's waste).

## Route C: local Explorer shell (costed, not built)

All of `CohortPanel`'s UI parts are exported (`QueryExpression`, `DropdownPanel`,
`DownloadsPanel`, `CountsValue`, `ExplorerTable`, `CohortManager`, `classifyFacets`, …).
Not exported, so we'd have to re-implement them against `@gen3/core` actions:
`useFilterExpandedState`, `useToggleExpandFilter`, `useCohortFilterCombineState`,
`useSetCohortFilterCombineState`, `useSowerJobEventBus`, `useDeepCompareMemo`. That's a
~350-line fork of `CohortPanel` + `CohortBuilder`, and upstream fixes to either would be
missed silently.
