import type * as echarts from 'echarts';
import type { PlotPoint } from "../types";
import type { UmapComparison } from "../processing/umapEmbeddings";
import { TARGET_PROJECT } from "../processing/nearestNeighbors";
import { groupTcga, INPUT_COLOR, NO_COLORING, OTHER_TCGA_COLOR } from "../processing/colorTcga";
import type { PointGroup, TcgaColoring } from "../processing/colorTcga";
import {useEffect, useMemo, useRef} from "react";
import { EMPTY_FILTER, matchesFilter } from "../processing/filterPlotData";
import type { MetadataFilter } from "../processing/filterPlotData";
import ReactECharts from 'echarts-for-react';
import { metadataFieldLabel } from '../utils';
const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const formatValue = (value: unknown) =>
    typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);

// metadata fields left out of the point tooltip
const TOOLTIP_HIDDEN_FIELDS: readonly string[] = ['project_id', 'case_id', "primary_site"];

// fraction of the input's range added on each side of the default zoom window
const ZOOM_PADDING = 0.1;

interface Bounds {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

/** Bounding box of the points, padded so edge points are not on the border; null when there are none. */
const getBounds = (points: PlotPoint[]): Bounds | null => {
    if (points.length === 0) return null;
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const { umap_x, umap_y } of points) {
        if (umap_x < xMin) xMin = umap_x;
        if (umap_x > xMax) xMax = umap_x;
        if (umap_y < yMin) yMin = umap_y;
        if (umap_y > yMax) yMax = umap_y;
    }
    // a single point (or a line) has no range, so fall back to a unit window
    const xPad = (xMax - xMin || 1) * ZOOM_PADDING;
    const yPad = (yMax - yMin || 1) * ZOOM_PADDING;
    return { xMin: xMin - xPad, xMax: xMax + xPad, yMin: yMin - yPad, yMax: yMax + yPad };
};

// marker sizes from the notebook: Plotly's default 6 for TCGA, 7 for the target project, 9 for the input
const TCGA_MARKER_SIZE = 6;
const TARGET_MARKER_SIZE = 7;
const INPUT_MARKER_SIZE = 9;

// filtered-out points stay in the data, invisible, so they never move; only their opacity animates
const toSeriesData = (points: PlotPoint[], filter: MetadataFilter) =>
    points.map((point) => ({
        value: [point.umap_x, point.umap_y],
        itemStyle: { opacity: matchesFilter(point, filter) ? 1 : 0 },
    }));

interface UMAPComparisonPlotProps {
    /** all points; the default zoom frames the input */
    data: UmapComparison;
    /** points not matching the filter fade out in place */
    metadataFilter?: MetadataFilter;
    /** how the TCGA points are colored; the input points always keep their own color */
    tcgaColoring?: TcgaColoring;
}

const UMAPComparisonPlot = ({ data, metadataFilter = EMPTY_FILTER, tcgaColoring = NO_COLORING } : UMAPComparisonPlotProps) => {

    const chartRef = useRef<ReactECharts>(null);
    // read by the tooltip, which lives in the memoized option and would otherwise see a stale filter
    const filterRef = useRef(metadataFilter);

    // the default zoom frames the input samples; TCGA points outside the window are still reachable by zooming out
    const inputBounds = useMemo(() => getBounds(data.input), [data.input]);
    // zooming out stops at the full extent of every point, so the plot cannot be dragged into empty space
    const allBounds = useMemo(() => getBounds([...data.tcga, ...data.input]), [data.tcga, data.input]);

    // one scatter series per group: the TCGA groups, then the input; the tooltip and the filter update
    // address the groups by series index
    const groups: PointGroup[] = useMemo(() => [
        ...groupTcga(data.tcga, tcgaColoring),
        { name: 'Cluster Input', color: INPUT_COLOR, points: data.input },
    ], [data, tcgaColoring]);
    const inputIndex = groups.length - 1;

    const seriesData: echarts.ScatterSeriesOption[] = useMemo(() =>
        groups.map((group, index) => {
            const isInput = index === inputIndex;
            return {
                name: group.name,
                type: 'scatter',
                // grayed-out TCGA under the colored groups, the input on top
                z: isInput ? 4 : group.color === OTHER_TCGA_COLOR ? 2 : 3,
                // smaller symbols keep 10k points readable; the target project is drawn slightly larger
                symbolSize: isInput
                    ? INPUT_MARKER_SIZE
                    : (_value: unknown, params: { dataIndex: number }) =>
                        group.points[params.dataIndex]?.group === TARGET_PROJECT ? TARGET_MARKER_SIZE : TCGA_MARKER_SIZE,
                itemStyle: isInput ? { color: group.color, borderColor: '#ffffff', borderWidth: 1 } : { color: group.color },
                data: toSeriesData(group.points, EMPTY_FILTER),
                dimensions: ['X', 'Y'],
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff'
                    }
                }
            };
        }), [groups, inputIndex]);


    // the option must not depend on the filter: filter changes are applied to the live chart below,
    // which keeps the zoom window and animates opacity instead of rebuilding the chart
    const option: echarts.EChartsOption = useMemo(() => ({
        animationDurationUpdate: 400,
        backgroundColor: '#ffffff',
        title: {
            text: 'UMAP Projection',
            left: 'center',
            textStyle: {color: '#000000', fontSize: 16}
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                // seriesIndex maps to the group, dataIndex to the plot point within it
                const point = groups[params.seriesIndex]?.points[params.dataIndex];
                if (!point || !matchesFilter(point, filterRef.current)) return ''; // faded-out points have no tooltip
                const rows = Object.entries(point?.metadata ?? {})
                    .filter(([key]) => TOOLTIP_HIDDEN_FIELDS.includes(key))
                    .map(([key, value]) => `<li><b>${escapeHtml(metadataFieldLabel(key))}</b>: ${escapeHtml(formatValue(value))}</li>`)
                    .join('');
                return `
        <strong style="color:${params.color}">${escapeHtml(params.seriesName)}</strong>
        <ul style="margin:0;padding-left:1.2em">${rows}</ul>
      `;
            }
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: {color: '#000000'},
            type: 'scroll'
        },
        xAxis: {
            type: 'value',
            scale: true, // Crucial: dynamically fits axis boundaries to data limits
            splitLine: {lineStyle: {color: '#e0e0e0'}},
            axisLabel: {color: '#000000'}
        },
        yAxis: {
            type: 'value',
            scale: true,
            splitLine: {lineStyle: {color: '#e0e0e0'}},
            axisLabel: {color: '#000000'}
        },
        toolbox: {
            right: 10,
            top: 10,
            feature: {
                dataZoom: {},
                restore: {},
                saveAsImage: {title: 'Export'}
            },
            iconStyle: {borderColor: '#000000'}
        },
        dataZoom: [
            // Fast wheel-scroll & pinch zooming, plus a slider, on x; inside zooming on y
            {type: 'inside', xAxisIndex: 0, ...(allBounds && {maxValueSpan: allBounds.xMax - allBounds.xMin}), ...(inputBounds && {startValue: inputBounds.xMin, endValue: inputBounds.xMax})},
            {type: 'slider', show: false, bottom: 10, xAxisIndex: 0, textStyle: {color: '#000000'},
                ...(allBounds && {maxValueSpan: allBounds.xMax - allBounds.xMin}),
                ...(inputBounds && {startValue: inputBounds.xMin, endValue: inputBounds.xMax})},
            {type: 'inside', yAxisIndex: 0, ...(allBounds && {maxValueSpan: allBounds.yMax - allBounds.yMin}), ...(inputBounds && {startValue: inputBounds.yMin, endValue: inputBounds.yMax})},
        ],
        series: seriesData
    }), [groups, inputBounds, allBounds, seriesData]);

    useEffect(() => {
        filterRef.current = metadataFilter;
        const chart = chartRef.current?.getEchartsInstance();
        if (!chart) return;
        chart.setOption({
            series: groups.map((group) => ({ data: toSeriesData(group.points, metadataFilter) })),
        });
    }, [groups, metadataFilter]);

    return (
        <div className="absolute inset-0">
        <ReactECharts
        ref={chartRef}
        option={option}
        notMerge={true}
        lazyUpdate={false}
        opts={{ renderer: 'canvas' }}
        style={{height: '100%', width: '100%'}}
        />
        </div>);
}

export default UMAPComparisonPlot;
