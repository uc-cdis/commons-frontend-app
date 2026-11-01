"use client";

import { memo, useMemo, type ReactNode } from "react";
import { Box, Group, Paper, Skeleton, Stack, Text, Tooltip } from "@mantine/core";
import { sameToolResult, type ToolRendererProps } from "../types";
import { DownloadButton } from "../DownloadButton";
import { CARD_DOWNLOADS, findDownload } from "../downloads";
import { useDownload } from "../useDownload";
import type { DownloadFailure } from "../loadDownload";
import { readSurvivalSummary, type SurvivalSummary } from "./readResult";
import { parseSurvivalResult, projectLabel, type SurvivalData } from "./parse";
import { MINIMUM_CASES, SurvivalPlot } from "./SurvivalPlot";

const HEIGHT = 300;

const UNAVAILABLE: Record<DownloadFailure, string> = {
  expired: "This curve has expired. Ask again to recompute it.",
  login: "Your login has ended. Log in again to see the curve.",
  failed: "Couldn't load the curve. Try again later.",
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Box pl="xs" style={{ borderLeft: "2px solid var(--chat-rule)" }}>
      <Text size="xs" fw={600} c="var(--chat-muted)" tt="uppercase">
        {label}
      </Text>
      <Text fw={700} c="var(--chat-value)">
        {value}
      </Text>
    </Box>
  );
}

function Tiles({ summary }: { summary: SurvivalSummary }) {
  return (
    <Group gap="lg" wrap="wrap">
      <Tile label="Donors" value={summary.donors.toLocaleString()} />
      {summary.estimates.map((e) => (
        <Tile key={e.years} label={`${e.years}-yr`} value={`${(e.value * 100).toFixed(1)}%`} />
      ))}
    </Group>
  );
}

function Curve({ data }: { data: SurvivalData }) {
  const { curves, pValue } = data;

  // Matches GDC's enoughData(): every curve must clear MINIMUM_CASES.
  if (curves.length === 0 || curves.some((c) => c.n < MINIMUM_CASES)) {
    return (
      <Text size="sm" c="var(--chat-muted)">
        Not enough survival data.
      </Text>
    );
  }

  return (
    <>
      {pValue !== undefined && (
        <Tooltip
          disabled={pValue !== 0}
          label="Value shows 0.00e+0 because the P-Value is extremely low and goes beyond the precision inherent in the code."
        >
          <Text size="xs" c="var(--chat-muted)">
            Log-Rank Test P-Value = {pValue.toExponential(2)}
          </Text>
        </Tooltip>
      )}
      <SurvivalPlot curve={curves[0]} height={HEIGHT} />
    </>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <Paper className="chat-tool-card" radius="sm" p="md" bg="var(--mantine-color-body)">
      {children}
    </Paper>
  );
}

function SurvivalToolResultImpl({ result }: ToolRendererProps) {
  const summary = useMemo(() => (result ? readSurvivalSummary(result) : null), [result]);
  // the curve's own link, as the agent wrote it; only links the portal serves come back
  const curveLink = useMemo(() => findDownload(result, "survival"), [result]);
  // Unconditional: a null url just idles the hook.
  const loaded = useDownload(curveLink?.url ?? null);
  const parsed = useMemo(() => (loaded?.ok ? parseSurvivalResult(loaded.text) : null), [loaded]);

  if (!result) {
    return (
      <Card>
        <Skeleton height={HEIGHT} radius="sm" />
      </Card>
    );
  }

  if (!summary && !curveLink) {
    return (
      <Card>
        <Text size="sm" c="var(--chat-muted)">
          Couldn&apos;t read the survival result.
        </Text>
      </Card>
    );
  }

  const project = parsed?.ok ? projectLabel(parsed.data.curves) : null;
  const failure = loaded && !loaded.ok ? loaded.reason : null;
  // an expired handle or an ended login would only make the buttons fail too
  const canDownload = CARD_DOWNLOADS && curveLink && failure !== "expired" && failure !== "login";

  return (
    <Card>
      <Stack gap="sm">
        <Text fw={700} c="var(--chat-title)">
          Overall survival{project ? ` · ${project}` : ""}
        </Text>

        {curveLink && !loaded && <Skeleton height={HEIGHT} radius="sm" />}
        {failure && (
          <Text size="sm" c={failure === "expired" ? "var(--chat-muted)" : "var(--chat-error)"}>
            {UNAVAILABLE[failure]}
          </Text>
        )}
        {parsed && !parsed.ok && (
          <Text size="sm" c="var(--chat-error)">
            Couldn&apos;t read the curve ({parsed.reason}).
          </Text>
        )}
        {parsed?.ok && <Curve data={parsed.data} />}

        {summary && <Tiles summary={summary} />}

        {canDownload && (
          <Group gap="xs" mt="xs">
            <DownloadButton href={curveLink.url} label="Download JSON" />
            {curveLink.csvUrl && <DownloadButton href={curveLink.csvUrl} label="Download CSV" />}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

export const SurvivalToolResult = memo(SurvivalToolResultImpl, sameToolResult);
