import { Group, Loader, Text } from "@mantine/core";
import { formatDuration } from "../util";

/** Two call sites: the live footer under the transcript, and a finished turn's clock. */
export function RunStatusBanner({
  isRunning,
  durationMs,
}: {
  isRunning: boolean;
  durationMs: number | null;
}) {
  // A settled turn with no duration is a chat reloaded from IndexedDB - timings are
  // in-memory only.
  const label = isRunning
    ? "Running..."
    : durationMs !== null
      ? `Turn completed in ${formatDuration(durationMs)}`
      : "Turn completed";

  return (
    <Group gap="xs">
      {isRunning && <Loader size="xs" type="dots" color="var(--chat-primary)" />}
      <Text size="xs" c="var(--chat-muted)">
        {label}
      </Text>
    </Group>
  );
}
