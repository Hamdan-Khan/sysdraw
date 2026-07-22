import type { Edge, Node } from "@xyflow/react";
import { createCanvasStore } from "../../store";

export const makeNode = (id: string, overrides?: Partial<Node>): Node => ({
  id,
  type: "rectangle",
  position: { x: 0, y: 0 },
  data: {},
  ...overrides,
});

export const makeGroupNode = (id: string, parentId?: string): Node =>
  makeNode(id, { type: "group-a", parentId });

export const makeRegularNode = (id: string, parentId?: string): Node =>
  makeNode(id, { type: "rectangle", parentId });

export const makeEdge = (
  id: string,
  source: string,
  target: string,
  overrides?: Partial<Edge>,
): Edge => ({
  id,
  source,
  target,
  ...overrides,
});

export const makeStore = (nodes: Node[] = [], edges: Edge[] = []) =>
  createCanvasStore({ nodes, edges });
