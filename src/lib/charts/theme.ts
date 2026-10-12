import themeColors from '../../../config/gen3/themeColors.json';

/**
 * The single source of colour for the chart layer. Component files never contain
 * colour literals: UI colours come from the commons theme tokens
 * (config/gen3/themeColors.json, the same file the Mantine/Tailwind theme is built
 * from) and the two data palettes below are the only hex values in src/lib/charts.
 */

/**
 * Okabe–Ito categorical palette, canonical order. Designed to stay distinguishable
 * under deuteranopia, protanopia and tritanopia (adjacent-pair CVD ΔE ≥ 15 in this
 * order; reordering it makes that worse). Several hues are under 3:1 against a white
 * card, so categorical marks always carry direct labels and a table view, never
 * colour alone. Beyond eight categories we group into "Other" and never cycle hues.
 */
export const OKABE_ITO = [
  '#E69F00', // orange
  '#56B4E9', // sky blue
  '#009E73', // bluish green
  '#F0E442', // yellow
  '#0072B2', // blue
  '#D55E00', // vermillion
  '#CC79A7', // reddish purple
  '#000000', // black
] as const;

export const MAX_CATEGORICAL = OKABE_ITO.length;

/**
 * Viridis, sampled at t = 0 … 0.5 in steps of 0.125. We use only the dark half:
 * past t ≈ 0.5 viridis turns yellow-green and drops below 3:1 against the card,
 * which would make low-count cells disappear. Still perceptually uniform, still
 * CVD-safe, and never red–green. Ordered high → low donor count.
 */
export const VIRIDIS_DARK_HALF = [
  '#440154',
  '#472d7b',
  '#3b528b',
  '#2c728e',
  '#21918c',
] as const;

/**
 * Texture per categorical slot (same index as OKABE_ITO), so pie slices differ by
 * pattern as well as hue: legible under any CVD, in greyscale print and in forced
 * colours. Slot 0 is solid. The decal ink is set by the chart from a surface token.
 */
interface DecalPattern {
  symbol: 'rect' | 'circle' | 'triangle' | 'diamond';
  symbolSize: number;
  dashArrayX: number[] | number[][];
  dashArrayY: number[];
  rotation?: number;
}

export const DECAL_PATTERNS: ReadonlyArray<DecalPattern | null> = [
  null,
  { symbol: 'rect', symbolSize: 1, dashArrayX: [1, 0], dashArrayY: [2, 5], rotation: Math.PI / 4 },
  { symbol: 'circle', symbolSize: 0.6, dashArrayX: [[8, 8], [0, 8, 8, 0]], dashArrayY: [6, 0] },
  { symbol: 'rect', symbolSize: 1, dashArrayX: [1, 0], dashArrayY: [2, 5], rotation: -Math.PI / 4 },
  { symbol: 'rect', symbolSize: 1, dashArrayX: [1, 0], dashArrayY: [2, 4], rotation: 0 },
  { symbol: 'triangle', symbolSize: 0.7, dashArrayX: [[8, 8], [0, 8, 8, 0]], dashArrayY: [6, 0] },
  { symbol: 'rect', symbolSize: 1, dashArrayX: [1, 0], dashArrayY: [2, 4], rotation: Math.PI / 2 },
  { symbol: 'diamond', symbolSize: 0.7, dashArrayX: [[8, 8], [0, 8, 8, 0]], dashArrayY: [6, 0] },
];

type Ramp =(typeof themeColors)['base'];

const base: Ramp = themeColors.base;
const primary = themeColors.primary;
const secondary = themeColors.secondary;
const accent = themeColors.accent;

/** Resolved UI colours for charts, all from theme tokens. */
export const chartTokens = {
  surface: base.max, // card background
  text: base.min, // primary ink
  textMuted: base.darkest, // axis labels, captions (≥ 4.5:1 on surface)
  grid: base.dark, // hairline gridlines / axes, recessive
  // single-series marks: position carries identity, so one strong hue
  series: primary.DEFAULT,
  seriesMuted: primary.lightest,
  // "Unknown" / "N/A" / "no data": a neutral, so placeholders never borrow a hue
  placeholder: secondary.darker,
  nonMember: secondary.darker, // heatmap "not in this combination" dot (≥ 3:1)
  focus: accent.dark,
  tooltipBorder: base.dark,
  shadow: `${base.min}1f`, // base.min at ~12% alpha
} as const;

const channel = (hex: string, i: number) => {
  const c = parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance of a #rrggbb colour. */
export const luminance = (hex: string): number =>
  0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);

/** WCAG contrast ratio between two #rrggbb colours. */
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Texture ink that stays visible on the given fill: dark on light fills, light on dark. */
export const decalInkFor = (fill: string): string =>
  luminance(fill) > 0.3 ? `${base.min}66` : `${base.max}8c`;

/** Label ink with ≥ 4.5:1 on the given fill (for labels set inside a mark). */
export const inkOn = (fill: string): string =>
  contrast(fill, base.min) >= contrast(fill, base.max) ? base.min : base.max;

export type ChartTokens = typeof chartTokens;
