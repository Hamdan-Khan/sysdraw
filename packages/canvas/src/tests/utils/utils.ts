import { createCanvasStore } from "@/store/store";
import type { Edge, Node } from "@xyflow/react";
import React from "react";
import { vi } from "vitest";

export const makeNode = (id: string, overrides?: Partial<Node>): Node => ({
  id,
  type: "rectangle",
  position: { x: 0, y: 0 },
  data: {},
  ...overrides,
});

export const makeGroupNode = (id: string, parentId?: string): Node =>
  makeNode(id, { type: "group-a", parentId, data: { kind: "group" } });

export const makeRegularNode = (id: string, parentId?: string): Node =>
  makeNode(id, { type: "rectangle", parentId, data: { kind: "node" } });

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

export const makeNativeMouseEvent = (
  overrides?: Partial<MouseEvent>,
): MouseEvent =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    clientX: 0,
    clientY: 0,
    ...overrides,
  }) as unknown as MouseEvent;

export const makeMouseEvent = (
  overrides?: Partial<React.MouseEvent>,
): React.MouseEvent =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    clientX: 0,
    clientY: 0,
    ...overrides,
  }) as unknown as React.MouseEvent;

export const makeDragEvent = (
  dataTransferData: Record<string, string> = {},
  overrides?: Partial<React.DragEvent>,
): React.DragEvent => {
  const data = new Map(Object.entries(dataTransferData));
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    clientX: 0,
    clientY: 0,
    dataTransfer: {
      getData: (format: string) => data.get(format) || "",
      setData: (format: string, value: string) => data.set(format, value),
      dropEffect: "none",
      effectAllowed: "uninitialized",
      types: Array.from(data.keys()),
    },
    ...overrides,
  } as unknown as React.DragEvent;
};
