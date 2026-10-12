import { describe, expect, it } from '@jest/globals';
import { formatPercent, groupTail, OTHER_KEY, summarise, toDistribution } from './data';

describe('toDistribution', () => {
  it('keeps suppressed (-1) categories but never sums them', () => {
    const d = toDistribution([
      { key: 'Alive', count: 300 },
      { key: 'Death', count: -1 },
      { key: 'no data', count: 57 },
    ]);
    expect(d.total).toBe(357);
    expect(d.suppressedCount).toBe(1);
    expect(d.data.map((x) => [x.label, x.count])).toEqual([
      ['Alive', 300],
      ['Death', null],
      ['No data', 57],
    ]);
  });

  it('sorts placeholders after real categories and drops empty keys', () => {
    const d = toDistribution([
      { key: 'Unknown', count: 110 },
      { key: '', count: 4 },
      { key: 'Pre', count: 20 },
      { key: 'Post', count: 50 },
    ]);
    expect(d.data.map((x) => x.key)).toEqual(['Post', 'Pre', 'Unknown']);
    expect(d.data[2].isPlaceholder).toBe(true);
  });
});

describe('groupTail', () => {
  it('folds the tail beyond max into Other and keeps placeholders separate', () => {
    const histogram = Array.from({ length: 10 }, (_, i) => ({ key: `c${i}`, count: 100 - i }));
    const d = groupTail(toDistribution([...histogram, { key: 'N/A', count: 5 }]), 8);
    const keys = d.data.map((x) => x.key);
    expect(keys).toHaveLength(9);
    expect(keys[7]).toBe(OTHER_KEY);
    expect(keys[8]).toBe('N/A');
    const other = d.data[7];
    expect(other.members?.map((m) => m.key)).toEqual(['c7', 'c8', 'c9']);
    expect(other.count).toBe(93 + 92 + 91);
    expect(d.total).toBe(toDistribution([...histogram, { key: 'N/A', count: 5 }]).total);
  });
});

describe('summarise', () => {
  it('states the finding', () => {
    const d = toDistribution([
      { key: 'Yes', count: 58 },
      { key: 'No', count: 275 },
    ]);
    expect(summarise('Distant Metastasis', 'donors', d, new Set(['Yes']))).toBe(
      'Distant Metastasis: 333 donors across 2 categories. Largest: No 275 (83%), Yes 58 (17%). Filtered to Yes.',
    );
  });

  it('describes the empty state', () => {
    expect(summarise('X', 'donors', toDistribution([]), new Set())).toBe(
      'X: no donors match the current filters.',
    );
  });

  it('formats small percentages with one decimal', () => {
    expect(formatPercent(1, 400)).toBe('0.3%');
    expect(formatPercent(null, 400)).toBe('–');
  });
});
