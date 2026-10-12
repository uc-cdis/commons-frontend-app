// Spike route A: add an ExplorerChartsPanelFactory registry to CohortPanel (esm + cjs + d.ts).
import fs from 'node:fs';

const root = process.argv[2] + '/node_modules/@gen3/frontend/dist';
const edit = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    const n = s.split(from).length - 1;
    if (n !== 1) throw new Error(`${file}: expected 1 match, got ${n} for ${from.slice(0, 80)}`);
    s = s.replace(from, to);
  }
  fs.writeFileSync(file, s);
};

const bundle = (ns) => {
  const p = (x) => (ns ? `${ns}.${x}` : x); // cjs prefixes React/core namespaces
  const jsx = ns ? 'jsxRuntime.jsx' : 'jsx';
  return [
    // 1. registry, declared right before CohortPanel
    [
      ' */ const CohortPanel = ({',
      ` */ let explorerChartsInstance;
const ExplorerChartsPanelFactory = ()=>{
    if (!explorerChartsInstance) {
        explorerChartsInstance = new RenderFactoryTypedInstance();
    }
    return explorerChartsInstance;
};
const CohortPanel = ({`,
    ],
    // 2. look up a custom panel for this index; skip the built-in chart aggregation if found
    [
      `    const chartKeys = useDeepCompareMemo(()=>[`,
      `    const CustomChartsPanel = ExplorerChartsPanelFactory().rendererExists('explorerCharts', index) ? ExplorerChartsPanelFactory().getRenderer('explorerCharts', index) : undefined;
    const chartKeys = useDeepCompareMemo(()=>[`,
    ],
    [
      `    }, {
        skip: chartKeys.length === 0
    });`,
      `    }, {
        skip: chartKeys.length === 0 || CustomChartsPanel !== undefined
    });`,
    ],
    // 3. render it in the charts slot
    [
      `                            chartsSection?.enabled ? /*#__PURE__*/ ${jsx}(CollapsableCharts, {`,
      `                            CustomChartsPanel ? /*#__PURE__*/ ${jsx}(CustomChartsPanel, {
                                index: index,
                                indexPrefix: indexPrefix,
                                tabTitle: tabTitle,
                                charts: charts,
                                cohortFilters: cohortFilters,
                                accessibility: accessLevel,
                                queryId: cohortId,
                                counts: counts,
                                isCountsFetching: isCountsFetching,
                                numCols: numCols
                            }) : chartsSection?.enabled ? /*#__PURE__*/ ${jsx}(CollapsableCharts, {`,
    ],
  ];
};

const esm = `${root}/index/esm`;
const cjs = `${root}/index/cjs`;
edit(`${esm}/index-DDIXM_VO.js`, [
  ...bundle(''),
  ['ExplorerTableDetailsPanelFactory as ai,', 'ExplorerTableDetailsPanelFactory as ai, ExplorerChartsPanelFactory as zzCharts,'],
]);
edit(`${esm}/index.js`, [
  ['ai as ExplorerTableDetailsPanelFactory,', 'ai as ExplorerTableDetailsPanelFactory, zzCharts as ExplorerChartsPanelFactory,'],
]);
edit(`${cjs}/index-D0coYH7R.js`, [
  ...bundle('cjs'),
  [
    'exports.ExplorerTableDetailsPanelFactory = ExplorerTableDetailsPanelFactory;',
    'exports.ExplorerTableDetailsPanelFactory = ExplorerTableDetailsPanelFactory;\nexports.ExplorerChartsPanelFactory = ExplorerChartsPanelFactory;',
  ],
]);
edit(`${cjs}/index.js`, [
  [
    'exports.ExplorerTableDetailsPanelFactory = index.ExplorerTableDetailsPanelFactory;',
    'exports.ExplorerTableDetailsPanelFactory = index.ExplorerTableDetailsPanelFactory;\nexports.ExplorerChartsPanelFactory = index.ExplorerChartsPanelFactory;',
  ],
]);
edit(`${root}/index.d.ts`, [
  [
    'declare const EnumFacetChart: React__default.FC<FacetChartProps>;',
    `declare const EnumFacetChart: React__default.FC<FacetChartProps>;

interface ExplorerChartsPanelProps {
    index: string;
    indexPrefix: string;
    tabTitle: string;
    charts: Record<string, SummaryChart>;
    cohortFilters: FilterSet;
    accessibility: Accessibility;
    queryId: string;
    counts: number | undefined;
    isCountsFetching: boolean;
    numCols: number;
}
declare const ExplorerChartsPanelFactory: () => RendererFactoryInterface<ExplorerChartsPanelProps>;`,
  ],
  ['ExplorerTableDetailsPanelFactory, FacetControlsHeader,', 'ExplorerTableDetailsPanelFactory, ExplorerChartsPanelFactory, FacetControlsHeader,'],
  ['EnumFacetResponse, EnumOperandValue,', 'EnumFacetResponse, EnumOperandValue, ExplorerChartsPanelProps,'],
]);
console.log('spike patch applied');
