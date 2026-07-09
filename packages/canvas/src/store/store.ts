import type { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

type InitialCanvasStoreState = {
  nodes: Node[];
  edges: Edge[];
};

interface CanvasStoreState extends InitialCanvasStoreState {
  nodes: Node[];
  setNodes: (nodes: Node) => void;
  edges: Edge[];
  setEdges: (edges: Edge) => void;
}

const createCanvasStore = (storeState: InitialCanvasStoreState) => {
  return create<CanvasStoreState>((set) => ({
    nodes: storeState.nodes || [],
    setNodes: (node: Node) => set((state) => ({ nodes: [...state.nodes, node] })),
    edges: storeState.edges || [],
    setEdges: (edge: Edge) => set((state) => ({ edges: [...state.edges, edge] })),
  }));
};

export { createCanvasStore, type CanvasStoreState, type InitialCanvasStoreState };
