import React from 'react';

export interface LegendItem {
  key: string;
  label: string;
  /** swatch colour from the chart theme; omitted when the item has no mark */
  color?: string;
  hidden: boolean;
  /** e.g. "suppressed" */
  note?: string;
}

interface CategoryLegendProps {
  items: ReadonlyArray<LegendItem>;
  onToggle: (key: string) => void;
  onHover: (key: string | null) => void;
}

/**
 * Show/hide categories, with hover/focus highlighting the matching mark. Plain
 * buttons, so it is keyboard reachable and announces its state.
 */
export const CategoryLegend = ({ items, onToggle, onHover }: CategoryLegendProps) => (
  <ul aria-label="Legend: toggle categories" className="mt-2 flex list-none flex-wrap gap-1 p-0">
    {items.map((item) => (
      <li key={item.key}>
        <button
          type="button"
          aria-pressed={!item.hidden}
          onClick={() => onToggle(item.key)}
          onMouseEnter={() => onHover(item.key)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(item.key)}
          onBlur={() => onHover(null)}
          className={`flex items-center gap-1 rounded border border-base-lighter px-1.5 py-0.5 text-xs hover:border-base-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-dark ${
            item.hidden ? 'text-base-darker line-through' : 'text-base-min'
          }`}
        >
          {item.color ? (
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.hidden ? 'transparent' : item.color, outline: `1px solid ${item.color}` }}
            />
          ) : null}
          {item.label}
          {item.note ? <span className="text-base-darkest">({item.note})</span> : null}
          <span className="sr-only">{item.hidden ? ', hidden' : ', shown'}</span>
        </button>
      </li>
    ))}
  </ul>
);
