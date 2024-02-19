import {
  DiscoveryCellRendererFactory,
  CellRenderFunctionProps,
} from '@gen3/frontend';
import { Badge } from '@mantine/core';
import React from 'react';
import {
  MdOutlineCheckCircle as CheckCircleOutlined,
  MdOutlineRemoveCircleOutline as MinusCircleOutlined,
} from 'react-icons/md';
import { isArray } from 'lodash';

/**
 * Custom cell renderer for the linked study column for HEAL
 * @param cell
 */
export const LinkedStudyCell = ({
  value: cellValue,
}: CellRenderFunctionProps<boolean>) => {
  const value = cellValue as boolean;
  return value ? (
    <Badge
      variant="outline"
      leftSection={<CheckCircleOutlined />}
      color="green"
    >
      Linked
    </Badge>
  ) : (
    <Badge leftSection={<MinusCircleOutlined />} color="primary">
      Not Linked
    </Badge>
  );
};

const WrappedStringCell = (
  { value }: CellRenderFunctionProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: any[0],
) => {
  const content = value as string | string[];
  return (
    <div className="w-40">
      <span className="break-words whitespace-break-spaces text-md">
        {isArray(content) ? content.join(', ') : content}
      </span>
    </div>
  );
};


/**
 * Register custom cell renderers for DiscoveryTable
 */
export const registerDiscoveryCustomCellRenderers = () => {
  DiscoveryCellRendererFactory.registerCellRendererCatalog({
    string: {
      default: WrappedStringCell,
    },
    boolean: {
      LinkedStudyCell,
    },
  });
};
