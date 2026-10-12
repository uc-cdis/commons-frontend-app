import { Accessibility } from '@gen3/core';
import type { BarOrientation } from './BarChart';
import type { Modality } from './modalityCombinations';

/**
 * Explorer tabs query with ACCESSIBLE (see patches/@gen3+frontend+0.12.69.patch),
 * while every @gen3/core hook defaults to ALL. Charts must match the tab, or their
 * numbers disagree with the tab's own count.
 */
export const CHART_ACCESSIBILITY = Accessibility.ACCESSIBLE;

interface ChartBase {
  title: string;
  /** "full" spans the whole charts row */
  width?: 'tile' | 'full';
}

export interface FieldChartDefinition extends ChartBase {
  type: 'bar' | 'pie';
  field: string;
  orientation?: BarOrientation;
}

export interface ModalityCombinationsDefinition extends ChartBase {
  type: 'modalityCombinations';
  idField: string;
  modalities: ReadonlyArray<Modality>;
  maxColumns?: number;
  maxRecords?: number;
  notes?: ReadonlyArray<string>;
}

export type ExplorerChartDefinition = FieldChartDefinition | ModalityCombinationsDefinition;

export interface ExplorerTabCharts {
  tabTitle: string;
  index: string;
  /** plural noun for the tab's entity, lower case */
  unit: string;
  charts: ReadonlyArray<ExplorerChartDefinition>;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

const parseChart = (raw: unknown): ExplorerChartDefinition | null => {
  if (!isObject(raw) || !isString(raw.title)) return null;
  const width = raw.width === 'full' ? 'full' : 'tile';
  if ((raw.type === 'bar' || raw.type === 'pie') && isString(raw.field)) {
    return {
      type: raw.type,
      field: raw.field,
      title: raw.title,
      width,
      orientation: raw.orientation === 'horizontal' ? 'horizontal' : 'vertical',
    };
  }
  if (
    raw.type === 'modalityCombinations' &&
    isString(raw.idField) &&
    Array.isArray(raw.modalities) &&
    raw.modalities.every((m) => isObject(m) && isString(m.field) && isString(m.label))
  ) {
    return {
      type: 'modalityCombinations',
      title: raw.title,
      width,
      idField: raw.idField,
      modalities: (raw.modalities as Array<Record<string, string>>).map((m) => ({
        field: m.field,
        label: m.label,
      })),
      maxColumns: typeof raw.maxColumns === 'number' ? raw.maxColumns : undefined,
      maxRecords: typeof raw.maxRecords === 'number' ? raw.maxRecords : undefined,
      notes: Array.isArray(raw.notes) ? raw.notes.filter(isString) : undefined,
    };
  }
  return null;
};

/**
 * Read `customCharts` from each Explorer tab in explorer.json. The framework ignores
 * this key; the built-in `charts` key is left out so the framework draws nothing.
 * Invalid entries are dropped loudly rather than rendered half-configured.
 */
export const parseExplorerCharts = (explorerConfig: unknown): ExplorerTabCharts[] => {
  if (!Array.isArray(explorerConfig)) return [];
  return explorerConfig.flatMap((tab: unknown) => {
    if (!isObject(tab) || !isString(tab.tabTitle) || !Array.isArray(tab.customCharts)) return [];
    const guppy = isObject(tab.guppyConfig) ? tab.guppyConfig : {};
    if (!isString(guppy.dataType)) return [];
    const charts = tab.customCharts.flatMap((raw: unknown) => {
      const parsed = parseChart(raw);
      if (!parsed) console.error('[charts] ignoring invalid customCharts entry', raw);
      return parsed ? [parsed] : [];
    });
    const title = isString(guppy.nodeCountTitle) ? guppy.nodeCountTitle : guppy.dataType;
    return [{ tabTitle: tab.tabTitle, index: guppy.dataType, unit: title.toLowerCase(), charts }];
  });
};
