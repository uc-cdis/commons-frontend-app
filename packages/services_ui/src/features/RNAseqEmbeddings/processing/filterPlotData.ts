import type { PlotPoint } from '../types';
import type { UmapComparison } from './umapEmbeddings';

export interface MetadataFilter {
    field: string | null;
    values: string[];
}

export const EMPTY_FILTER: MetadataFilter = { field: null, values: [] };

// fields with more distinct values than this are not useful to filter on
const MAX_FILTER_VALUES = 50;
const MISSING_LABEL = '(missing)';

export const valueKey = (value: unknown): string => (value == null ? MISSING_LABEL : String(value));

/**
 * Metadata fields that can be filtered on, mapped to their sorted distinct values.
 * Skips fields holding objects, with a single value, or with too many distinct values.
 */
export const getFilterableFields = (data: UmapComparison): Record<string, string[]> => {
    const seen = new Map<string, Set<string>>();
    const excluded = new Set<string>();

    for (const point of [...data.tcga, ...data.input]) {
        for (const [field, value] of Object.entries(point.metadata ?? {})) {
            if (excluded.has(field)) continue;
            if (typeof value === 'object' && value !== null) {
                excluded.add(field);
                continue;
            }
            let values = seen.get(field);
            if (!values) seen.set(field, (values = new Set()));
            values.add(valueKey(value));
            if (values.size > MAX_FILTER_VALUES) excluded.add(field);
        }
    }

    const fields: Record<string, string[]> = {};
    for (const [field, values] of [...seen].sort(([a], [b]) => a.localeCompare(b))) {
        if (excluded.has(field) || values.size < 2) continue;
        fields[field] = [...values].sort();
    }
    return fields;
};

/** True when the point passes the filter; an empty filter matches everything. */
export const matchesFilter = (point: PlotPoint, { field, values }: MetadataFilter): boolean =>
    !field || values.length === 0 || values.includes(valueKey(point.metadata?.[field]));

/** Keeps only the points whose metadata[field] is one of the selected values. */
export const filterPlotData = (data: UmapComparison, filter: MetadataFilter): UmapComparison => {
    if (!filter.field || filter.values.length === 0) return data;
    const keep = (point: PlotPoint) => matchesFilter(point, filter);
    return { tcga: data.tcga.filter(keep), input: data.input.filter(keep) };
};
