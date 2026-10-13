# Explorer charts

The Explorer's summary charts are our own components (`src/lib/charts/`) built on the
ECharts instance bundled with `@gen3/frontend`. The framework's built-in `charts`
config is no longer used.

## Adding or changing a chart

Charts are declared per tab in `config/gen3/explorer.json` under `customCharts`. The
framework ignores this key. Don't reintroduce a `charts` key, or the framework will
draw its own charts as well.

```jsonc
"customCharts": [
  { "type": "bar", "field": "modality", "title": "Modality" },          // vertical by default
  { "type": "bar", "field": "tissue_site", "title": "Tissue Site", "orientation": "horizontal" },
  { "type": "pie", "field": "phenotype", "title": "Phenotype" },
  { "type": "modalityCombinations", "title": "…", "width": "full",           // Assays tab
    "groupField": "donor_id", "categoryField": "modality", "unit": "donors",
    "modalities": [{ "value": "wgs", "label": "WGS" }, …], "maxColumns": 20, "maxRecords": 10000 }
]
```

- `field` must exist in the tab's Guppy index (`bcca-portal/etl.yaml`). A missing field
  shows the chart's error state and logs `[charts] field … not returned`.
- Use `pie` only for low-cardinality fields. Beyond 8 real categories the tail is folded
  into "Other" (the palette never cycles).
- Invalid entries are dropped with a console error.

## The layer

| File | Role |
|---|---|
| `theme.ts` | The only place colours are defined: Okabe–Ito, viridis (dark half), decal patterns, UI tokens from `config/gen3/themeColors.json` |
| `useChartTheme.ts` | Shared tooltip/axis styling, reduced-motion handling |
| `ChartFrame.tsx` | Card, title, `n = …`, selection banner + Clear, loading / error / empty states, data-table fallback |
| `ChartCanvas.tsx` | a11y contract: `role="img"` + finding-based label; keyboard listbox (arrows, Enter, Escape); stable ECharts event binding |
| `BarChart.tsx`, `PieChart.tsx`, `HeatmapChart.tsx` | Presentational charts |
| `ModalityCombinationChart.tsx`, `modalityCombinations.ts` | Donors per exact / at-least modality combination (pure logic unit-tested) |
| `ExplorerTabCharts.tsx` | One aggregation query per tab (`filterSelf: false`), grid layout |
| `ExplorerChartsPortal.tsx` | Mounts each tab's charts inside the framework's tab panel |

Conventions:
- Every query passes `CHART_ACCESSIBILITY` (`ACCESSIBLE`), to match the tab's own counts.
- Charts ignore their own field's filter, like facets, so a selection is shown in context.
- Guppy returns `-1` for suppressed small counts. These are listed but never drawn or summed.
- Click-to-filter goes through `useUpdateFilters` / `useClearFilters` (the facets' hooks).
- The modality-combination chart sits on the Assays tab and is built from that tab's
  assay records: it groups them by `donor_id` into each donor's modality set, so it
  follows the Assays cohort. Clicking a column filters the assays to those donors
  (`donor_id in […]`), which is exact for both "exactly" and "at least" modes.

## Upgrading `@gen3/frontend`: check these

`ExplorerChartsPortal.tsx` relies on three internals of the framework's Explorer:

1. Mantine tab panels have ids ending in `-panel-<tabTitle>`.
2. Each panel contains `#cohort-builder-content` (`CohortPanel`).
3. That element's first child is the downloads/counts row; charts go after it.

If any of these change, the charts silently fail to mount, and after 15 s the console
logs `[charts] no mount point for Explorer tab …`. After an upgrade, open `/Explorer`
and check all three tabs show charts.

Also re-check:
- that `ReactECharts` still only binds `events` once (`useStableHandler` works around this);
- that the access-level patch still sets `ACCESSIBLE`, or update `CHART_ACCESSIBILITY`.

## Tests

```sh
NODE_OPTIONS=--no-experimental-strip-types npx jest src/lib/charts
```

The flag is needed on Node ≥ 24: `jest.config.ts` uses `__dirname`, which Node's native
TypeScript loading treats as ESM.
