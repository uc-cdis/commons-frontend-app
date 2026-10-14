/**
 * Geometry for the UpSet plot at a given width. Everything scales so that every
 * column always fits: nothing is cropped or scrolled away on a narrow screen.
 */
export interface UpSetLayout {
  /** set-size bar panel width (incl. room for its count labels) */
  setWidth: number;
  setLabelRoom: number;
  /** modality name column between the set bars and the matrix */
  labelWidth: number;
  /** x where the bars and matrix start */
  left: number;
  right: number;
  /** width of one column's slot */
  band: number;
  dotRadius: number;
  linkWidth: number;
  /** the set-size axis ticks only fit when the panel is wide; bars carry counts anyway */
  showSetAxisLabels: boolean;
  /** axis/row label size */
  fontSize: number;
  /** count label size above the bars: shrinks with the slot, always horizontal */
  countFontSize: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const upsetLayout = (width: number, columns: number): UpSetLayout => {
  const right = 16;
  const setWidth = Math.round(clamp(width * 0.14, 72, 160));
  const setLabelRoom = Math.round(clamp(setWidth * 0.25, 22, 40));
  // wide enough for the longest modality name ("Chromium") at every width
  const labelWidth = Math.round(clamp(width * 0.075, 76, 84));
  const left = 8 + setWidth + labelWidth;
  const band = Math.max(1, (width - left - right) / Math.max(1, columns));
  const dotRadius = clamp(band * 0.25, 2.5, 7.5);
  return {
    setWidth,
    setLabelRoom,
    labelWidth,
    left,
    right,
    band,
    dotRadius,
    linkWidth: clamp(dotRadius * 0.4, 1, 3),
    showSetAxisLabels: setWidth >= 120,
    fontSize: band < 18 ? 9 : 11,
    countFontSize: Math.round(clamp(band * 0.4, 8, 11)),
  };
};
