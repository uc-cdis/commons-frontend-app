/** The unique names in a model list, or none when it isn't one; Mantine's Select throws on duplicates. */
export function modelNames(list: unknown): string[] {
  return Array.isArray(list)
    ? [...new Set(list.filter((name): name is string => typeof name === "string"))]
    : [];
}

/**
 * The model a run asks for: the saved pick if the agent offers it, else its first model. With no
 * list (loading, failed or empty) the saved pick goes unchecked; the agent falls back to its first
 * model if it's gone.
 */
export function modelToSend(
  models: readonly string[],
  saved: string | undefined,
): string | undefined {
  if (models.length === 0 || (saved !== undefined && models.includes(saved))) return saved;
  return models[0];
}
