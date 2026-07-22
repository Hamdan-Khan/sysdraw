import { act, renderHook } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearClipboard, isClipboardEmpty, useCopyPaste } from "../hooks";
import { CanvasStoreProvider } from "../store";
import {
  mockGetEdges,
  mockGetNodes,
  mockScreenToFlowPosition,
  mockSetEdges,
  mockSetNodes,
} from "./utils/mocks";
import { makeStore } from "./utils/utils";

const createWrapper = (initial: { nodes?: Node[]; edges?: Edge[] } = {}) => {
  const store = makeStore(initial.nodes, initial.edges);
  return ({ children }: { children: React.ReactNode }) =>
    createElement(CanvasStoreProvider, { store, children });
};

let idCounter = 1;
vi.mock("nanoid", () => ({
  nanoid: () => `mock-id-${idCounter++}`,
}));

describe("useCopyPaste", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearClipboard();
    idCounter = 1;
  });

  const mockNodes: Node[] = [
    {
      id: "1",
      position: { x: 0, y: 0 },
      data: { label: "Node 1" },
      selected: true,
      measured: { width: 100, height: 50 },
    },
    {
      id: "2",
      position: { x: 100, y: 100 },
      data: { label: "Node 2" },
      selected: false,
      measured: { width: 100, height: 50 },
    },
  ];

  const mockEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2", selected: false }];

  it("should not copy anything if no nodes are selected", () => {
    mockGetNodes.mockReturnValue([{ ...mockNodes[0], selected: false }, mockNodes[1]]);
    mockGetEdges.mockReturnValue(mockEdges);

    const { result } = renderHook(() => useCopyPaste(), { wrapper: createWrapper() });

    act(() => {
      result.current.copy();
    });

    act(() => {
      result.current.paste();
    });

    expect(mockSetNodes).not.toHaveBeenCalled();
    expect(mockSetEdges).not.toHaveBeenCalled();
  });

  it("should skip locked nodes when copying", () => {
    const lockedNode: Node = {
      id: "locked",
      position: { x: 0, y: 0 },
      data: {},
      selected: true,
      draggable: false,
    };
    mockGetNodes.mockReturnValue([lockedNode]);
    mockGetEdges.mockReturnValue([]);

    const { result } = renderHook(() => useCopyPaste(), {
      wrapper: createWrapper({ nodes: [lockedNode] }),
    });

    act(() => result.current.copy());
    act(() => result.current.paste());

    expect(mockSetNodes).not.toHaveBeenCalled();
  });

  it("should copy selected nodes and paste them with new IDs", () => {
    mockGetNodes.mockReturnValue(mockNodes);
    mockGetEdges.mockReturnValue(mockEdges);

    const { result } = renderHook(() => useCopyPaste(), { wrapper: createWrapper() });

    act(() => {
      // Node 1 is selected
      result.current.copy();
    });

    act(() => {
      result.current.paste();
    });

    expect(mockSetNodes).toHaveBeenCalledTimes(1);

    // setNodes receives a callback
    const setNodesFn = mockSetNodes.mock.calls[0][0];
    const newNodes = setNodesFn(mockNodes);

    // should deselect existing node 1, and add the new one
    expect(newNodes.length).toBe(3);

    const pastedNode = newNodes[2];
    expect(pastedNode.id).toBe("mock-id-1");
    // ensure position shifted based on offset logic
    expect(pastedNode.position.x).toBeGreaterThan(0);
    expect(pastedNode.position.y).toBeGreaterThan(0);
    expect(pastedNode.selected).toBe(true);

    // old node should be deselected
    expect(newNodes[0].selected).toBe(false);
  });

  it("should copy edges if both source and target are copied", () => {
    const bothSelectedNodes: Node[] = [
      { id: "1", position: { x: 0, y: 0 }, data: {}, selected: true },
      { id: "2", position: { x: 100, y: 100 }, data: {}, selected: true },
    ];
    mockGetNodes.mockReturnValue(bothSelectedNodes);
    mockGetEdges.mockReturnValue(mockEdges);

    const { result } = renderHook(() => useCopyPaste(), { wrapper: createWrapper() });

    act(() => {
      result.current.copy();
    });

    act(() => {
      result.current.paste();
    });

    expect(mockSetEdges).toHaveBeenCalledTimes(1);

    const setEdgesFn = mockSetEdges.mock.calls[0][0];
    const newEdges = setEdgesFn(mockEdges);

    // original edge + the newly pasted edge
    expect(newEdges.length).toBe(2);

    const pastedEdge = newEdges[1];
    // idCounter was 1 for Node 1, 2 for Node 2, 3 for Edge
    expect(pastedEdge.id).toBe("mock-id-3");
    expect(pastedEdge.source).toBe("mock-id-1");
    expect(pastedEdge.target).toBe("mock-id-2");
    expect(pastedEdge.selected).toBe(true);
  });

  it("pastes at cursor position when anchor is provided", () => {
    mockGetNodes.mockReturnValue(mockNodes);
    mockGetEdges.mockReturnValue(mockEdges);
    const { result } = renderHook(() => useCopyPaste(), { wrapper: createWrapper() });

    act(() => result.current.copy());
    act(() => result.current.paste({ x: 500, y: 500 }));

    expect(mockScreenToFlowPosition).toHaveBeenCalledWith({ x: 500, y: 500 });
    const newNodes = mockSetNodes.mock.calls[0][0](mockNodes);
    expect(newNodes[2].position.x).toBeCloseTo(560); // 500 + 100 * 1 * 0.6
  });

  describe("isClipboardEmpty util", () => {
    it("returns true initially when clipboard is empty", () => {
      expect(isClipboardEmpty()).toBe(true);
    });

    it("returns false after copying selected nodes", () => {
      mockGetNodes.mockReturnValue(mockNodes);
      mockGetEdges.mockReturnValue(mockEdges);
      const { result } = renderHook(() => useCopyPaste(), { wrapper: createWrapper() });

      act(() => result.current.copy());
      expect(isClipboardEmpty()).toBe(false);
      expect(result.current.isClipboardEmpty()).toBe(false);
    });

    it("returns true after clearClipboard is called", () => {
      mockGetNodes.mockReturnValue(mockNodes);
      mockGetEdges.mockReturnValue(mockEdges);
      const { result } = renderHook(() => useCopyPaste(), { wrapper: createWrapper() });

      act(() => result.current.copy());
      expect(isClipboardEmpty()).toBe(false);

      clearClipboard();
      expect(isClipboardEmpty()).toBe(true);
      expect(result.current.isClipboardEmpty()).toBe(true);
    });
  });
});
