import { RegisteredEdges } from "@sysdraw/models";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { StoreApi } from "zustand";
import { CanvasStoreState } from "../store";

afterEach(() => {
  cleanup();
});

type Selector = (state: Partial<CanvasStoreState>) => Partial<CanvasStoreState>;

vi.mock("zustand", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zustand")>();
  const { mockSetNodes, mockSetEdges } = await import("./utils/mocks");
  return {
    ...actual,
    useStore: (store: StoreApi<CanvasStoreState>, selector: Selector) =>
      store?.getState
        ? selector(store.getState())
        : selector({
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
            commit: vi.fn(),
            undo: vi.fn(),
            redo: vi.fn(),
            setNodes: mockSetNodes,
            setEdges: mockSetEdges,
            globalEdgeType: RegisteredEdges.STRAIGHT,
            globalEdgeAnimated: false,
            globalEdgeMarkerEnd: undefined,
            setGlobalEdgeType: vi.fn(),
            setGlobalEdgeAnimated: vi.fn(),
            setGlobalEdgeMarkerEnd: vi.fn(),
            isInteractive: true,
            grid: true,
          }),
  };
});

vi.mock("sonner", async () => {
  const { mockToast } = await import("./utils/mocks");
  return { toast: mockToast };
});

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  const {
    mockGetEdge,
    mockGetEdges,
    mockGetIntersectingNodes,
    mockGetInternalNode,
    mockGetNodes,
    mockGetNodesBounds,
    mockScreenToFlowPosition,
    mockSetEdges,
    mockSetNodes,
    mockSetViewport,
  } = await import("./utils/mocks");

  return {
    ...actual,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => children,
    useReactFlow: () => ({
      getEdge: mockGetEdge,
      getEdges: mockGetEdges,
      getIntersectingNodes: mockGetIntersectingNodes,
      getInternalNode: mockGetInternalNode,
      getNodes: mockGetNodes,
      getNodesBounds: mockGetNodesBounds,
      screenToFlowPosition: mockScreenToFlowPosition,
      setEdges: mockSetEdges,
      setNodes: mockSetNodes,
      setViewport: mockSetViewport,
    }),
  };
});
