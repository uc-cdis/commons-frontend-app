'use client';
import React, { ReactElement } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { Badge, Box, Text } from '@mantine/core';
import {
  StudyDetailsField,
  RowRenderFunctionParams,
  DiscoveryRowRendererFactory,
  useDiscoveryContext,
  getTagColor,
} from '@gen3/frontend';


interface TagData {
  name: string;
  category: string;
}

const DetailsWithTagsRowRenderer =
  (
    { row } : RowRenderFunctionParams,
    studyPreviewConfig?: StudyDetailsField,
  ): ReactElement => {
    const { discoveryConfig: config, setStudyDetails } = useDiscoveryContext();

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
        sx={{
          display: 'flex',
          width: '100%',
        }}
        onClick={() => {
          setStudyDetails(() => {
            return { ...row.original };
          });
        }}
      >
        <div className="flex flex-col">
          <Text size="sm" lineClamp={2}>
            {value}
          </Text>

          <div className="flex space-x-6 space-y-6 flex-wrap">
            {row.original?.tags.map(({ name, category }: TagData) => {
              const color = getTagColor(category, config.tagCategories);
              if (name === '') return null; // no tag
              return (
                  <Badge
                    role="button"
                    size="lg"
                    radius="sm"
                    variant="outline"
                    tabIndex={0}
                    aria-label={name}
                    key={name}
                    style={{
                      borderColor: color,
                      borderWidth: '3px',
                      margin: '0 0.125rem',
                    }}
                  >
                    {name}
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
