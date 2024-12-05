import React,{ ReactNode } from 'react';
import {
  ExplorerTableCellRendererFactory,
  type CellRendererFunctionProps,
} from '@gen3/frontend';
import { ActionIcon, Text } from '@mantine/core';

import { FaExternalLinkAlt } from 'react-icons/fa';


const RenderLinkCell = (
  { cell }: CellRendererFunctionProps,
) => {
  return (
    <a
      href={`${cell.getValue()}`}
      target="_blank"
      rel="noreferrer"
    >
      <Text c="blue" td="underline" fw={700}>
        {' '}
        {cell.getValue() as ReactNode}{' '}
      </Text>
    </a>
  );
};


const RenderDicomLink = ({ cell }: CellRendererFunctionProps) => {
  if (!cell.getValue() || cell.getValue() === '') {
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

export const registerCohortTableCustomCellRenderers = () => {
  ExplorerTableCellRendererFactory().registerRenderer(
      'link', 'DicomLink' ,
      RenderDicomLink,
  );
  ExplorerTableCellRendererFactory().registerRenderer(
    'link', 'linkURL' ,
    RenderLinkCell,
  );
};
