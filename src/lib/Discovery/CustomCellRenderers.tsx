import { DiscoveryCellRendererFactory } from '@gen3/frontend';
import type { CellRenderFunctionProps } from '@gen3/frontend';
import { Badge, Text } from '@mantine/core';
import React from 'react';
import {
  MdOutlineCheckCircle as CheckCircleOutlined,
  MdOutlineRemoveCircleOutline as MinusCircleOutlined,
} from 'react-icons/md';
import { isArray, toString } from 'lodash';
import { JSONObject } from '@gen3/core';
import { FilemapInline, FilemapPopup } from '@/lib/Discovery/Filemap';
import { isTextTransform } from '@gen3/frontend';

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
  params?: JSONObject,
) => {
  const ttValue = isTextTransform(params?.transform)
    ? params?.transform
    : undefined;
  const size = (params?.size as string) || 'sm';
  if (value === undefined || value === null || toString(value) === '') {
    return (
      <Text tt={ttValue} size={size}>
        {`${
          params && params?.valueIfNotAvailable
            ? params?.valueIfNotAvailable
            : ''
        }`}
      </Text>
    );
  }

  const content = value as string | string[];
  return (
    <Text tt={ttValue} size={size} textWrap="pretty">
      {isArray(content) ? content.join(', ') : content}
    </Text>
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
    manifest: {
      default: FilemapPopup,
      inline: FilemapInline,
    },
  });
};
