import React from 'react';
import {
  CellRenderFunctionProps,
  ReactECharts,
  ReactEChartsProps,
} from '@gen3/frontend';
import { Button, Popover, Text } from '@mantine/core';
import { isArray } from 'lodash';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useDisclosure } from '@mantine/hooks';

/**
 * Represents a manifest item.
 * @interface ManifestItem
 */
interface ManifestItem {
  md5sum: string;
  file_name: string;
  file_size?: number;
  object_id: string;
  commons_name?: string;
}

/**
 * Interface representing the data structure for Bar Chart.
 *
 * @interface
 * @name BarChartData
 * @property {number} value - The numerical value associated with the bar.
 * @property {string} name - The name or label associated with the bar.
 */
interface BarChartData {
  value: number;
  name: string;
}

/**
 * Counts the number of occurrences of file types in the given data array and returns an array of objects
 * representing the file type and its percentage value within the total count.
 *
 * @param {Array<ManifestItem>} data - The array of data containing ManifestItem objects.
 * @returns {Array<BarChartData>} - The array of objects representing file types and their percentages.
 */
const countTypes = (data: Array<ManifestItem>): BarChartData[] => {
  const counts: Record<string, number> = {};
  data.forEach((item: ManifestItem) => {
    const filetype = item.file_name.split('.').pop();
    if (!filetype) return;
    counts[filetype] = counts[filetype] ? counts[filetype] + 1 : 1;
  });
  const total = Object.values(counts).reduce((acc, val) => acc + val, 0);
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value: Number(((value / total) * 100).toFixed(2)),
  }));
};

/**
 * Converts an array of manifest items into a chart definition for React ECharts.
 *
 * @param {Array<ManifestItem>} data - The array of manifest items to convert.
 * @returns {ReactEChartsProps['option'] | undefined} - The chart definition or undefined if the data is invalid or empty.
 */
const useProcessManifestToChart = (
  values: Array<ManifestItem>,
  showLabel = true,
  showToolip = false,
): ReactEChartsProps['option'] | undefined => {
  const chartDefinition = useDeepCompareMemo(():
    | ReactEChartsProps['option']
    | undefined => {
    if (
      values === undefined ||
      values === null ||
      !isArray(values) ||
      values.length === 0
    ) {
      return undefined;
    }

    const data = countTypes(values);

    return {
      grid: {
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
      },
      tooltip: {
        trigger: 'item',
        show: showToolip,
        formatter: '{a} - {c}%',
        position: 'right',
        z: 100,
      },
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        show: false,
      },
      series: data.map((d) => ({
        type: 'bar',
        stack: 'total',
        barWidth: 40,
        name: d.name,
        data: [d.value],
        label: {
          show: showLabel,
          position: 'top',
          minMargin: 8,
          formatter: '{a} - {c}%',
        },
        labelLine: {
          show: true,
        },
        labelLayout: () => {
          return {
            y: '35%',
            moveOverlap: 'shiftX',
          };
        },
      })),
    };
  }, [values]);

  return chartDefinition;
};

/**
 * Represents a Filemap popup component.
 *
 * @component
 * @param {Object} value - An object containing the __manifest value to render.
 * @returns {JSX.Element} - The rendered JSX element.
 */
export const FilemapPopup = ({ value }: CellRenderFunctionProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  const chartDefinition = useProcessManifestToChart(value[0]);

  if (!chartDefinition) {
    return <Text>n/a</Text>;
  }
  return (
    <Popover position="left-start" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <Button variant="outline" onMouseEnter={open} onMouseLeave={close}>
          {value[0].length}
        </Button>
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
        <div style={{ width: 380 }}>
          <ReactECharts option={chartDefinition} />
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};

/**
 * Render a chart component based on the provided value.
 *
 * @param {object} value - An object or array containing the value for the chart component.
 * @returns {JSX.Element} - The rendered chart component.
 */
export const FilemapInline = ({ value }: CellRenderFunctionProps) => {
  const chartDefinition = useProcessManifestToChart(value[0], false, true);

  if (!chartDefinition) {
    return <Text>n/a</Text>;
  }
  return (
    <div className="w-16">
      <ReactECharts
        option={chartDefinition}
        style={{ width: '80px', height: '32px' }}
      />
    </div>
  );
};
