'use client';
import React, { ReactElement } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { Badge, Box, Text } from '@mantine/core';
import {
  StudyDetailsField,
  RowRenderFunctionParams,
  DiscoveryRowRendererFactory,
  useDiscoveryContext,
  getTagInfo,
  TagData,
} from '@gen3/frontend';

const DetailsWithTagsRowRenderer = (
  { row }: RowRenderFunctionParams,
  studyPreviewConfig?: StudyDetailsField,
): ReactElement => {
  const { discoveryConfig: config } = useDiscoveryContext();

  if (!studyPreviewConfig) {
    return <React.Fragment></React.Fragment>;
  }
  const value =
    JSONPath({
      json: row.original,
      path: studyPreviewConfig.field,
    }) ??
    config?.studyPreviewField?.valueIfNotAvailable ??
    '';

  return (
    <Box
      style={{
        display: 'flex',
        width: '100%',
      }}
    >
      <div className="flex flex-col">
        <Text size="sm" lineClamp={2}>
          {value}
        </Text>

        <div className="flex space-x-6 space-y-6 flex-wrap">
          {row.original?.tags?.map((tagInfo: TagData) => {
            const { color, display, label } = getTagInfo(tagInfo, config.tags);

            if (tagInfo.name === '') return null; // no tag
            if (!display) return null;
            return (
              <Badge
                role="button"
                size="lg"
                radius="sm"
                variant="outline"
                tabIndex={0}
                aria-label={tagInfo.name}
                key={tagInfo.name}
                style={{
                  borderColor: color,
                  borderWidth: '3px',
                  margin: '0.125rem 0.125rem',
                }}
              >
                {label}
              </Badge>
            );
          })}
        </div>
      </div>
    </Box>
  );
};

export default DetailsWithTagsRowRenderer;

export const registerDiscoveryStudyPreviewRenderers = () => {
  DiscoveryRowRendererFactory.registerRowRendererCatalog({
    string: {
      default: DetailsWithTagsRowRenderer,
    },
  });
};
