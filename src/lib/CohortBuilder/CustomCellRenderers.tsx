import React, { ReactNode } from 'react';
import {
  ExplorerTableCellRendererFactory,
  type CellRendererFunctionProps,
} from '@gen3/frontend';
import { ActionIcon, Text } from '@mantine/core';
import { FaExternalLinkAlt } from 'react-icons/fa';

const RenderDicomLink = ({ cell }: CellRendererFunctionProps) => {
  if (!cell?.getValue() || cell?.getValue() === '') {
    return <span></span>;
  } else
    return (
      <a href={`${cell.getValue()}`} target="_blank" rel="noreferrer">
        <ActionIcon color="accent.5" size="md" variant="filled">
          <FaExternalLinkAlt />
        </ActionIcon>
      </a>
    );
};

const JoinFields = (
  { cell, row }: CellRendererFunctionProps,
  ...args: Array<Record<string, unknown>>
) => {
  if (!cell?.getValue() || cell?.getValue() === '') {
    return <span></span>;
  } else {
    if (
      typeof args[0] === 'object' &&
      Object.keys(args[0]).includes('otherFields')
    ) {
      const otherFields = args[0].otherFields as Array<string>;
      const labels = otherFields.map((field) => {
        return row.getValue(field);
      });
      return <Text fw={600}> {labels.join(' ')}</Text>;
    }
  }
  return <span>Not configured</span>;
};

const RenderLinkCell = ({ cell }: CellRendererFunctionProps) => {
  return (
    <a href={`${cell.getValue()}`} target="_blank" rel="noreferrer">
      <Text c="blue" td="underline" fw={700}>
        {' '}
        {cell.getValue() as ReactNode}{' '}
      </Text>
    </a>
  );
};

export const registerCohortTableCustomCellRenderers = () => {
  ExplorerTableCellRendererFactory().registerRenderer(
    'link',
    'DicomLink',
    RenderDicomLink,
  );
  ExplorerTableCellRendererFactory().registerRenderer(
    'string',
    'JoinFields',
    JoinFields,
  );
  ExplorerTableCellRendererFactory().registerRenderer(
    'link',
    'linkURL',
    RenderLinkCell,
  );
};
