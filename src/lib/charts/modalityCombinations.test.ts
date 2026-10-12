import { describe, expect, it } from '@jest/globals';
import {
  columnsFor,
  combinationFilter,
  NO_ASSAYS_LABEL,
  selectedCombination,
  summariseCombinations,
  type Modality,
} from './modalityCombinations';

const MODALITIES: Modality[] = [
  { field: 'wgs_count', label: 'WGS' },
  { field: 'visium_count', label: 'Visium' },
  { field: 'xenium_count', label: 'Xenium' },
];

const donor = (wgs: unknown, visium: unknown, xenium: unknown) => ({
  wgs_count: wgs,
  visium_count: visium,
  xenium_count: xenium,
});

describe('summariseCombinations', () => {
  const records = [
    donor(2, 1, 1), // all three
    donor(1, 3, 0), // WGS + Visium
    donor(4, 0, 0), // WGS only
    donor(1, 0, 0), // WGS only
    donor(0, 0, 2), // Xenium only
    donor(null, null, null), // no assays at all (rollups missing)
    donor(0, 0, 0), // no assays (rollups present, zero)
  ];
  const summary = summariseCombinations(records, MODALITIES);

  it('exclusive counts sum to the donor total', () => {
    const sum = summary.combinations.reduce((a, c) => a + c.exclusive, 0);
    expect(sum).toBe(records.length);
    expect(summary.donorCount).toBe(records.length);
  });

  it('treats counts > 0 as membership and missing as absent, not imputed', () => {
    const byLabel = Object.fromEntries(
      summary.combinations.map((c) => [c.label, c.exclusive]),
    );
    expect(byLabel).toEqual({
      'WGS + Visium + Xenium': 1,
      'WGS + Visium': 1,
      WGS: 2,
      Xenium: 1,
      [NO_ASSAYS_LABEL]: 2,
    });
    expect(summary.partiallyMissing).toBe(0);
  });

  it('computes inclusive ("at least these") counts', () => {
    const wgs = summary.combinations.find((c) => c.label === 'WGS');
    const wgsVisium = summary.combinations.find((c) => c.label === 'WGS + Visium');
    expect(wgs?.inclusive).toBe(4);
    expect(wgsVisium?.inclusive).toBe(2);
  });

  it('flags donors with some counts present and others missing', () => {
    const s = summariseCombinations([donor(1, null, 0)], MODALITIES);
    expect(s.partiallyMissing).toBe(1);
  });

  it('orders columns by the active mode and drops "No assays" when inclusive', () => {
    const exclusive = columnsFor(summary, 'exclusive').map((c) => c.label);
    expect(exclusive.slice(0, 2)).toEqual(['No assays', 'WGS']);
    const inclusive = columnsFor(summary, 'inclusive');
    expect(inclusive[0].label).toBe('WGS');
    expect(inclusive.some((c) => c.mask === 0)).toBe(false);
  });

  it('handles every donor having the same single modality', () => {
    const s = summariseCombinations([donor(1, 0, 0), donor(3, 0, 0)], MODALITIES);
    expect(columnsFor(s, 'exclusive')).toHaveLength(1);
    expect(s.combinations[0]).toMatchObject({ label: 'WGS', exclusive: 2, inclusive: 2 });
  });

  it('handles no donors', () => {
    const s = summariseCombinations([], MODALITIES);
    expect(s.combinations).toHaveLength(0);
    expect(columnsFor(s, 'exclusive')).toHaveLength(0);
  });
});

describe('combinationFilter / selectedCombination', () => {
  it('exclusive filter constrains members to >= 1 and the rest to <= 0', () => {
    const root = combinationFilter(0b011, MODALITIES, 'exclusive');
    expect(root.wgs_count).toEqual({
      operator: 'and',
      operands: [{ operator: '>=', field: 'wgs_count', operand: 1 }],
    });
    expect(root.xenium_count).toEqual({
      operator: 'and',
      operands: [{ operator: '<=', field: 'xenium_count', operand: 0 }],
    });
    expect(selectedCombination(root, MODALITIES)).toEqual({ mask: 0b011, mode: 'exclusive' });
  });

  it('inclusive filter only constrains members', () => {
    const root = combinationFilter(0b100, MODALITIES, 'inclusive');
    expect(Object.keys(root)).toEqual(['xenium_count']);
    expect(selectedCombination(root, MODALITIES)).toEqual({ mask: 0b100, mode: 'inclusive' });
  });

  it('does not claim a filter someone else wrote on the same fields', () => {
    const root = {
      wgs_count: {
        operator: 'and' as const,
        operands: [
          { operator: '>=' as const, field: 'wgs_count', operand: 2 },
          { operator: '<=' as const, field: 'wgs_count', operand: 9 },
        ],
      },
    };
    expect(selectedCombination(root, MODALITIES)).toBeNull();
    expect(selectedCombination({}, MODALITIES)).toBeNull();
  });
});
