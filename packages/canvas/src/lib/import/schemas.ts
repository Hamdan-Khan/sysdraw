import { z } from "zod";

export const NodeHandleConfigSchema = z.object({
  id: z.string(),
  type: z.enum(["source", "target"]),
  position: z.enum(["top", "right", "bottom", "left"]).optional(),
  style: z.record(z.string(), z.unknown()).optional(),
});

export const IconTypeSchema = z.object({
  kind: z.string(),
  value: z.string(),
});

/** subject to change */
export const NodeDataSchema = z.looseObject({
  kind: z.enum(["node", "group"]).optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: IconTypeSchema.optional(),
  handles: z.array(NodeHandleConfigSchema).optional(),
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const NodeSchema = z.object({
  // required fields
  id: z.string(),
  position: PositionSchema,
  data: NodeDataSchema,

  // optional fields
  type: z.string().optional(),
  parentId: z.string().nullable().optional(),
  className: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  selected: z.boolean().optional(),
  hidden: z.boolean().optional(),
  draggable: z.boolean().optional(),
  selectable: z.boolean().optional(),
  connectable: z.boolean().optional(),
  deletable: z.boolean().optional(),
  focusable: z.boolean().optional(),
  zIndex: z.number().optional(),
  extent: z
    .union([
      z.literal("parent"),
      z.tuple([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number()])]),
    ])
    .nullable()
    .optional(),
  expandParent: z.boolean().optional(),
  ariaLabel: z.string().optional(),
  style: z.record(z.string(), z.unknown()).optional(),
  measured: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
});

export const EdgeDataSchema = z.looseObject({
  label: z.string().optional(),
  protocol: z.string().optional(),
});

export const EdgeSchema = z.object({
  // required fields
  id: z.string(),
  source: z.string(),
  target: z.string(),

  // optional fields
  type: z.string().optional(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  animated: z.boolean().optional(),
  selected: z.boolean().optional(),
  hidden: z.boolean().optional(),
  deletable: z.boolean().optional(),
  focusable: z.boolean().optional(),
  label: z.union([z.string(), z.unknown()]).optional(),
  labelStyle: z.record(z.string(), z.unknown()).optional(),
  labelShowBg: z.boolean().optional(),
  labelBgStyle: z.record(z.string(), z.unknown()).optional(),
  labelBgPadding: z.tuple([z.number(), z.number()]).optional(),
  labelBgBorderRadius: z.number().optional(),
  style: z.record(z.string(), z.unknown()).optional(),
  className: z.string().optional(),
  zIndex: z.number().optional(),
  ariaLabel: z.string().optional(),
  markerStart: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  markerEnd: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  data: EdgeDataSchema.optional(),
});

export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

/**
 * main project file schema for import validation
 */
export const ImportSchema = z.object({
  version: z.string(),
  viewport: ViewportSchema,
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export type ImportFile = z.infer<typeof ImportSchema>;
