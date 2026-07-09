import { create } from "zustand";

type InitialCanvasStoreState = {
  nodes: any[];
  edges: any[];
};

interface CanvasStoreState extends InitialCanvasStoreState {
  nodes: any[];
  setNodes: (nodes: any[]) => void;
  edges: any[];
  setEdges: (edges: any[]) => void;
}

const createCanvasStore = (storeState: InitialCanvasStoreState) => {
  return create<CanvasStoreState>((set) => ({
    nodes: storeState.nodes || [],
    setNodes: (node: any) => set((state) => ({ nodes: [...state.nodes, node] })),
    edges: storeState.edges || [],
    setEdges: (edge: any) => set((state) => ({ edges: [...state.edges, edge] })),
  }));
};

export { createCanvasStore, type CanvasStoreState, type InitialCanvasStoreState };
