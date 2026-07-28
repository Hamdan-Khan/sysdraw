import { ImportSchema, type ImportFile } from "./schemas";

/**
 * parses a project JSON object against the ImportSchema
 */
export const parseProjectFile = (json: unknown): ImportFile | null => {
  const result = ImportSchema.safeParse(json);
  if (!result.success) {
    return null;
  }
  return result.data;
};

export { ImportSchema, type ImportFile };
