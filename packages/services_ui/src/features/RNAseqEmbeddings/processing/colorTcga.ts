import type { PlotPoint } from '../types';
import { valueKey } from './filterPlotData';

/** TCGA metadata fields the plot can color by; the input samples are never recolored. */
export const TCGA_COLOR_FIELDS = {
    project_id: 'Project',
    primary_site: 'Primary Site',
} as const;

export type TcgaColorField = keyof typeof TCGA_COLOR_FIELDS;

export interface TcgaColoring {
    /** null draws every TCGA sample in one color */
    field: TcgaColorField | null;
    /** values that get their own color, the rest of TCGA is grayed out; empty colors every value */
    values: string[];
}

export const NO_COLORING: TcgaColoring = { field: null, values: [] };

export const TCGA_COLOR = '#5470c6';
export const OTHER_TCGA_COLOR = '#c8c8c8';
export const INPUT_COLOR = '#000000';

// Tableau 20 without its grays, so a colored group never looks like "Other TCGA"
const PALETTE = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#dbdb8d', '#9edae5',
];

/** n distinct colors: the palette when it is long enough, otherwise evenly spaced hues. */
const colorsFor = (n: number): string[] =>
    n <= PALETTE.length
        ? PALETTE.slice(0, n)
        : Array.from({ length: n }, (_, i) => `hsl(${Math.round((360 * i) / n)}, 65%, 50%)`);

export interface PointGroup {
    name: string;
    color: string;
    points: PlotPoint[];
}

/** Sorted distinct values of `field` across the TCGA points. */
export const getColorValues = (tcga: PlotPoint[], field: TcgaColorField | null): string[] =>
    field ? [...new Set(tcga.map((p) => valueKey(p.metadata?.[field])))].sort() : [];

/**
 * Splits the TCGA points into one group per colored value, plus a gray "Other TCGA" group
 * when only some values are selected. Groups with no points are dropped.
 */
export const groupTcga = (tcga: PlotPoint[], { field, values }: TcgaColoring): PointGroup[] => {
    if (!field) return [{ name: 'Cluster TCGA', color: TCGA_COLOR, points: tcga }];

    const colored = values.length > 0 ? values : getColorValues(tcga, field);
    const byValue = new Map<string, PlotPoint[]>(colored.map((v) => [v, []]));
    const other: PlotPoint[] = [];
    for (const point of tcga) {
        (byValue.get(valueKey(point.metadata?.[field])) ?? other).push(point);
    }

    const colors = colorsFor(colored.length);
    const groups: PointGroup[] = colored
        .map((name, i) => ({ name, color: colors[i], points: byValue.get(name) ?? [] }))
        .filter((g) => g.points.length > 0);
    if (other.length > 0) groups.unshift({ name: 'Other TCGA', color: OTHER_TCGA_COLOR, points: other });
    return groups;
};
