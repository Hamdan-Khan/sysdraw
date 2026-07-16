import { vi } from "vitest";
import { StoreApi } from "zustand";
import { CanvasStoreState } from "../store";

type Selector = (state: Partial<CanvasStoreState>) => Partial<CanvasStoreState>;

vi.mock("zustand", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zustand")>();
  const { mockSetNodes, mockSetEdges, mockOnConnect } = await import("./mocks");
  return {
    ...actual,
    useStore: (_store: StoreApi<CanvasStoreState>, selector: Selector) =>
      selector({ setNodes: mockSetNodes, setEdges: mockSetEdges, onConnect: mockOnConnect }),
  };
});

vi.mock("sonner", async () => {
  const { mockToast } = await import("./mocks");
  return { toast: mockToast };
});

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  const {
    mockGetEdges,
    mockGetIntersectingNodes,
    mockGetInternalNode,
    mockGetNodes,
    mockGetNodesBounds,
    mockScreenToFlowPosition,
    mockSetEdges,
    mockSetNodes,
    mockSetViewport,
  } = await import("./mocks");

  return {
    ...actual,
    useReactFlow: () => ({
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
