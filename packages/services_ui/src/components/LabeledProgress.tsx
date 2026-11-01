import { Progress } from '@mantine/core';

interface LabeledProgressProps {
    value: number; // 0-100
    label?: string;
}

export function LabeledProgress({ value, label }: LabeledProgressProps) {
    return (
        <Progress.Root size="xl" radius="xl" aria-label={label ?? 'Progress'}>
            <Progress.Section value={value} color="blue" animated>
                <Progress.Label>{label ?? `${Math.round(value)}%`}</Progress.Label>
            </Progress.Section>
        </Progress.Root>
    );
}

export default LabeledProgress;
