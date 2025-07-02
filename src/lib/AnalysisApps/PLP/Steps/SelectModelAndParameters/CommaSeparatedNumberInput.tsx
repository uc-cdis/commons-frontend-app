import React, { useState, useEffect } from 'react';
import { TextInput, Tooltip, ActionIcon, Group, Text } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';

function parseCommaSeparatedNumbers(input: string): number[] | null {
  const arr = input
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  if (arr.length === 0) return null;
  if (arr.some(part => isNaN(Number(part)))) return null;
  return arr.map(Number);
}

interface CommaSeparatedNumberInputProps {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  [x: string]: any; // spread other props to TextInput
}

const CommaSeparatedNumberInput: React.FC<CommaSeparatedNumberInputProps> = ({
  label,
  tooltip = "You can provide a single number (e.g. 123) or a comma-separated list (e.g. 123, 456). When you provide a list, the model will run for each value, assess the results, and use the best one.",
  value,
  onChange,
  required = false,
  placeholder = 'e.g. 100,200 OR 100',
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInternalValue(val);

    if (required && val.length === 0) {
      setError('This field is required');
    } else if (val.length > 0 && parseCommaSeparatedNumbers(val) === null) {
      setError('Enter a single number or comma-separated numbers (e.g. 100,200,300)');
    } else {
      setError(null);
    }

    onChange(val);
  }

  return (
    <TextInput
      label={
        <Group mb={1} gap={4}>
          <Text fz="sm">{label}</Text>
          {required && <Text span c="red">*</Text>}
          <Tooltip
            label={tooltip}
            multiline
            withArrow
            withinPortal
            w="90vh"
          >
            <ActionIcon variant="light" size="xs" tabIndex={-1}>
              <IconQuestionMark size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      }
      placeholder={placeholder}
      value={internalValue}
      onChange={handleChange}
      error={error}
      {...rest}
    />
  );
};

export default CommaSeparatedNumberInput;
