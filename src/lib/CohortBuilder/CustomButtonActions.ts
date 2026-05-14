import { registerButtonAction } from '@gen3/frontend';

/**
 * Converts a GQL filter object to a formatted Python dict string.
 */
const filterToPython = (obj: unknown, indent = 0): string => {
  const pad = ' '.repeat(indent * 4);
  const innerPad = ' '.repeat((indent + 1) * 4);

  if (obj === null || obj === undefined) return 'None';
  if (typeof obj === 'boolean') return obj ? 'True' : 'False';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map((v) => `${innerPad}${filterToPython(v, indent + 1)}`);
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const items = entries.map(
      ([k, v]) => `${innerPad}${JSON.stringify(k)}: ${filterToPython(v, indent + 1)}`,
    );
    return `{\n${items.join(',\n')},\n${pad}}`;
  }

  return String(obj);
};

/**
 * Registered button action: "copy-filter-python"
 *
 * Serialises the current Explorer filter + data_type into a ready-to-paste
 * Python snippet that calls guppy_download() in the threat-hunting notebook.
 */
const copyFilterAsPythonAction = async (
  params: Record<string, unknown>,
  done?: () => void,
): Promise<void> => {
  const dataType = (params.type as string) ?? 'audit_event';
  const filter = params.filter ?? {};

  const filterStr = filterToPython(filter);
  const code = [
    `# Cohort filter from Vectis Explorer — paste into notebook`,
    `data_type = ${JSON.stringify(dataType)}`,
    `gql_filter = ${filterStr}`,
    ``,
    `df = guppy_download(data_type, gql_filter=gql_filter)`,
    `df.head()`,
  ].join('\n');

  try {
    await navigator.clipboard.writeText(code);
  } catch {
    // Fallback: prompt so the user can copy manually
    window.prompt('Copy the filter snippet below:', code);
  }

  if (done) done();
};

export const registerCustomButtonActions = (): void => {
  registerButtonAction('copy-filter-python', {
    action: copyFilterAsPythonAction,
    args: {},
  });
};
