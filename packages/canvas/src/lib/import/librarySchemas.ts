import { z } from "zod";
import { IconTypeSchema } from "./schemas";

export const LibraryNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["node", "group"]),
  label: z.string(),
  icon: IconTypeSchema.optional(),
  description: z.string().optional(),
});

export const LibraryManifestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Library name is required"),
  version: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  path: z.string().optional(),
  nodes: z.array(LibraryNodeSchema),
});

export type ParsedLibraryNode = z.infer<typeof LibraryNodeSchema>;
export type ParsedLibraryManifest = z.infer<typeof LibraryManifestSchema>;
