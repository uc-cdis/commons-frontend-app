import type * as echarts from 'echarts';
import type { PlotPoint } from "../types";
import type { UmapComparison } from "../processing/umapEmbeddings";
import type { NeighborRow } from "../processing/nearestNeighbors";
import { TARGET_PROJECT } from "../processing/nearestNeighbors";
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

interface NeighborPair {
    from: PlotPoint;
    to: PlotPoint;
}

/**
 * Pairs each input point with the TCGA point of its nearest neighbor, joined on case_id.
 * `neighbors[i]` belongs to `data.input[i]`; pairs with no matching TCGA point are skipped.
 */
const getNeighborPairs = (data: UmapComparison, neighbors: NeighborRow[] | null): NeighborPair[] => {
    if (!neighbors) return [];
    const tcgaByCase = new Map(data.tcga.map((point) => [point.metadata?.case_id, point]));
    const pairs: NeighborPair[] = [];
    data.input.forEach((from, i) => {
        const to = tcgaByCase.get(neighbors[i]?.nearest?.metadata?.case_id);
        if (to) pairs.push({ from, to });
    });
    return pairs;
};

// a line fades with its endpoints: it is hidden when either point is filtered out
const toLinesData = (pairs: NeighborPair[], filter: MetadataFilter) =>
    pairs.map(({ from, to }) => ({
        coords: [[from.umap_x, from.umap_y], [to.umap_x, to.umap_y]],
        lineStyle: { opacity: matchesFilter(from, filter) && matchesFilter(to, filter) ? 1 : 0 },
    }));

interface UMAPComparisonPlotProps {
    /** all points; the default zoom frames the input */
    data: UmapComparison;
    /** points not matching the filter fade out in place */
    metadataFilter?: MetadataFilter;
    /** nearest TCGA neighbor of each input sample, in the same order as `data.input`; draws a line to each */
    neighbors?: NeighborRow[] | null;
}

const UMAPComparisonPlot = ({ data, metadataFilter = EMPTY_FILTER, neighbors = null } : UMAPComparisonPlotProps) => {

    const chartRef = useRef<ReactECharts>(null);
    // read by the tooltip, which lives in the memoized option and would otherwise see a stale filter
    const filterRef = useRef(metadataFilter);

    // the default zoom frames the input samples; TCGA points outside the window are still reachable by zooming out
    const inputBounds = useMemo(() => getBounds(data.input), [data.input]);
    // zooming out stops at the full extent of every point, so the plot cannot be dragged into empty space
    const allBounds = useMemo(() => getBounds([...data.tcga, ...data.input]), [data.tcga, data.input]);

    const neighborPairs = useMemo(() => getNeighborPairs(data, neighbors), [data, neighbors]);

// 4. Build out your typed ECharts series array
    // the scatter series come first: the tooltip and the filter update address them by index (0 TCGA, 1 input)
    const seriesData: (echarts.ScatterSeriesOption | echarts.LinesSeriesOption)[] = useMemo(() =>
        [{
            name: `Cluster TCGA`,
            type: 'scatter',
            z: 3,
            // smaller symbols keep 10k points readable; the target project is drawn slightly larger
            symbolSize: (_value: unknown, params: { dataIndex: number }) =>
                data.tcga[params.dataIndex]?.group === TARGET_PROJECT ? TARGET_MARKER_SIZE : TCGA_MARKER_SIZE,
            data: toSeriesData(data.tcga, EMPTY_FILTER),
            dimensions: ['X', 'Y'],
            emphasis: {
                focus: 'series',
                itemStyle: {
                    borderWidth: 1,
                    borderColor: '#fff'
                }
            }
        },
            {
                name: `Cluster Input`,
                type: 'scatter',
                z: 3,
                symbolSize: INPUT_MARKER_SIZE,
                itemStyle: { borderColor: '#ffffff', borderWidth: 1 },
                data: toSeriesData(data.input, EMPTY_FILTER),
                dimensions: ['X', 'Y'],
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff'
                    }
                }
            },
            // a line from each input to its nearest TCGA neighbor, beneath the points; no name, so no legend entry
            {
                type: 'lines',
                coordinateSystem: 'cartesian2d',
                silent: true,
                z: 1,
                lineStyle: { color: '#000000', width: 1 },
                data: toLinesData(neighborPairs, EMPTY_FILTER),
            }
        ], [data, neighborPairs]);


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
                // series 0 is TCGA, series 1 is the input; dataIndex maps back to the plot point
                const point = (params.seriesIndex === 0 ? data.tcga : data.input)[params.dataIndex];
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
    }), [data, inputBounds, allBounds, seriesData]);

    useEffect(() => {
        filterRef.current = metadataFilter;
        const chart = chartRef.current?.getEchartsInstance();
        if (!chart) return;
        chart.setOption({
            series: [
                { data: toSeriesData(data.tcga, metadataFilter) },
                { data: toSeriesData(data.input, metadataFilter) },
                { data: toLinesData(neighborPairs, metadataFilter) },
            ],
        });
    }, [data, metadataFilter, neighborPairs]);

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
