/**
 * Recursively converts all undefined values in an object to null
 * @param obj The object to process
 * @returns A new object with all undefined values converted to null
 */
export const ensureSerializable = <T>(obj: T): T => {
  if (obj === undefined) {
    return null as unknown as T;
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(ensureSerializable) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, ensureSerializable(value)])
  ) as unknown as T;
}
