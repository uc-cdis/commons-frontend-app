import { describe, expect, it } from '@jest/globals';
import {
  columnsFor,
  combinationFilter,
  idsFor,
  selectedCombination,
  summariseCombinations,
  type Modality,
} from './modalityCombinations';

const MODALITIES: Modality[] = [
  { value: 'wgs', label: 'WGS' },
  { value: 'visium', label: 'Visium' },
  { value: 'xenium', label: 'Xenium' },
];

const assay = (donor_id: unknown, modality: string) => ({ donor_id, modality });

const summarise = (records: Array<Record<string, unknown>>) =>
  summariseCombinations(records, 'donor_id', 'modality', MODALITIES);

describe('summariseCombinations', () => {
  const records = [
    assay('D1', 'wgs'),
    assay('D1', 'visium'),
    assay('D1', 'xenium'), // D1: all three
    assay('D2', 'wgs'),
    assay('D2', 'wgs'), // repeated modality counts once
    assay('D2', 'visium'), // D2: WGS + Visium
    assay('D3', 'wgs'), // D3: WGS only
    assay('D4', 'wgs'), // D4: WGS only
    assay('D5', 'xenium'), // D5: Xenium only
    assay('D6', 'report'), // D6: only an unconfigured modality
    assay(null, 'wgs'), // no donor: can't be attributed
  ];
  const summary = summarise(records);

  it('exclusive counts sum to the donors that have a configured modality', () => {
    const sum = summary.combinations.reduce((a, c) => a + c.exclusive, 0);
    expect(sum).toBe(5);
    expect(summary.groupCount).toBe(6); // D6 is a donor, just not in any column
  });

  it('builds each donor’s modality set from its assays', () => {
    const byLabel = Object.fromEntries(summary.combinations.map((c) => [c.label, c.exclusive]));
    expect(byLabel).toEqual({
      'WGS + Visium + Xenium': 1,
      'WGS + Visium': 1,
      WGS: 2,
      Xenium: 1,
    });
  });

  it('counts records it cannot place, rather than dropping them silently', () => {
    expect(summary.otherCategoryRecords).toBe(1);
    expect(summary.ungroupedRecords).toBe(1);
  });

  it('computes inclusive ("at least these") counts', () => {
    const find = (label: string) => summary.combinations.find((c) => c.label === label);
    expect(find('WGS')?.inclusive).toBe(4);
    expect(find('WGS + Visium')?.inclusive).toBe(2);
    expect(find('Xenium')?.inclusive).toBe(2);
  });

  it('orders columns by the active mode', () => {
    expect(columnsFor(summary, 'exclusive')[0].label).toBe('WGS');
    expect(columnsFor(summary, 'inclusive')[0].label).toBe('WGS');
  });

  it('handles every donor having the same single modality', () => {
    const s = summarise([assay('A', 'wgs'), assay('B', 'wgs')]);
    expect(s.combinations).toHaveLength(1);
    expect(s.combinations[0]).toMatchObject({ label: 'WGS', exclusive: 2, inclusive: 2 });
  });

  it('handles no records', () => {
    const s = summarise([]);
    expect(s.combinations).toHaveLength(0);
    expect(s.groupCount).toBe(0);
  });
});

describe('filters', () => {
  const summary = summarise([
    assay('D1', 'wgs'),
    assay('D1', 'visium'),
    assay('D2', 'wgs'),
    assay('D3', 'wgs'),
  ]);
  const WGS = 0b001;
  const WGS_VISIUM = 0b011;

  it('selects a column’s donors by id, exactly or inclusively', () => {
    expect(idsFor(summary, WGS, 'exclusive')).toEqual(['D2', 'D3']);
    expect(idsFor(summary, WGS, 'inclusive')).toEqual(['D1', 'D2', 'D3']);
    expect(combinationFilter('donor_id', ['D2', 'D3'])).toEqual({
      operator: 'in',
      field: 'donor_id',
      operands: ['D2', 'D3'],
    });
  });

  it('recognises its own selection and nothing else', () => {
    const op = combinationFilter('donor_id', idsFor(summary, WGS_VISIUM, 'exclusive'));
    expect(selectedCombination(op, summary)).toEqual({ mask: WGS_VISIUM, mode: 'exclusive' });
    const inclusive = combinationFilter('donor_id', idsFor(summary, WGS, 'inclusive'));
    expect(selectedCombination(inclusive, summary)).toEqual({ mask: WGS, mode: 'inclusive' });
    expect(selectedCombination(combinationFilter('donor_id', ['D2']), summary)).toBeNull();
    expect(selectedCombination(undefined, summary)).toBeNull();
  });
});
