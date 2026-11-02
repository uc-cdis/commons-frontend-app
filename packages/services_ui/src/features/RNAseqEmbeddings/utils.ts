import { toDisplayName } from "@gen3/frontend";


export const formatNumber = (n: number) =>
  Number.isNaN(n) ? "NaN" : Number.isInteger(n) ? n.toString() : n.toFixed(2);

// the data calls it "gender" but the values are sex at birth
const FIELD_NAME_OVERRIDES: Record<string, string> = { gender: "sex_at_birth" };

/** Display a label for a metadata field name, shared by the filter select and the tooltip. */
export const metadataFieldLabel = (field: string) =>
  toDisplayName(FIELD_NAME_OVERRIDES[field] ?? field);
