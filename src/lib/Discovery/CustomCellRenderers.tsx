import {
  DiscoveryCellRendererFactory,
  CellRenderFunctionProps,
} from '@gen3/frontend';
import { Badge, Text } from '@mantine/core';
import React from 'react';
import {
  MdOutlineCheckCircle as CheckCircleOutlined,
  MdOutlineRemoveCircleOutline as MinusCircleOutlined,
} from 'react-icons/md';
import { isArray } from 'lodash';
import { JSONObject } from '@gen3/core';
import { toString } from 'lodash';
import { FilemapPopup, FilemapInline } from '@/lib/Discovery/Filemap';

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
   
  params?: JSONObject,
) => {

  if (value === undefined || value === null || toString(value) === '') {
    return (
      <Text>
        {`${
          params && params?.valueIfNotAvailable
            ? params?.valueIfNotAvailable
            : ''
        }`}{' '}
      </Text>
    );
  }

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
    manifest: {
      default: FilemapPopup,
      inline: FilemapInline,
    }
  });
};
