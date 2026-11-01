"use client";

import { Stack, Text, Title, UnstyledButton, Group } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { EXAMPLES_WIDTH, INTRO_WIDTH } from "./util";

// the agent's own examples (gdc-mcp-demo agent/index.html), so they're questions it handles
const EXAMPLE_QUESTIONS = [
  "What is the 1-year survival estimate for TCGA-CHOL?",
  "Make a download manifest of all the RNA-Seq files for TCGA-CHOL.",
  "What is the prevalence of BRAF SSMs in lung cancer cases of non smoking women over 40?",
  "What is the average gene expression for TP53 and MUC16 in cases with lung adenocarcinoma?",
  "List the most variably expressed genes in APOLLO-LUAD.",
  "Compare the expression of TP53, MUC16, and BRAF in APOLLO-LUAD.",
] as const;

export interface EmptyStateProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function EmptyState({ onSelect, disabled }: EmptyStateProps) {
  return (
    <Stack gap="xl" align="center">
      <Stack gap="sm" align="center" ta="center">
        <Title order={1} c="var(--chat-title)">
          Ask GDC About Cancer Data
        </Title>
        <Text size="lg" maw={INTRO_WIDTH} textWrap="wrap">
          Use <b>Genomics Explorer</b> to ask questions about harmonized GDC data: cohorts,
          mutations, gene expression, survival and files.
        </Text>
      </Stack>

      <Stack gap="xs" w="100%" maw={EXAMPLES_WIDTH}>
        <Text size="xs" fw={700} c="var(--chat-accent)" lts="1px">
          EXAMPLE QUERIES
        </Text>
        {EXAMPLE_QUESTIONS.map((q) => (
          <UnstyledButton
            key={q}
            onClick={() => !disabled && onSelect(q)}
            disabled={disabled}
            px="md"
            py="sm"
            style={{
              borderRadius: "var(--mantine-radius-sm)",
              border: "1px solid var(--chat-rule)",
              backgroundColor: "var(--mantine-color-body)",
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <Group justify="space-between" wrap="nowrap" gap="md">
              <Text size="sm" textWrap="wrap">
                {q}
              </Text>
              <IconArrowRight size={18} color="var(--chat-accent)" style={{ flexShrink: 0 }} />
            </Group>
          </UnstyledButton>
        ))}
      </Stack>
    </Stack>
  );
}
