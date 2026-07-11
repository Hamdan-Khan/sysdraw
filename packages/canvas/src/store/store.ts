import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";

type InitialCanvasStoreState = {
  nodes: Node[];
  edges: Edge[];
};

interface CanvasStoreState extends InitialCanvasStoreState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
}

/**
 * create a canvas state store composed of nodes and edges.
 */
const createCanvasStore = (storeState: InitialCanvasStoreState) => {
  return create<CanvasStoreState>((set, get) => ({
    nodes: storeState.nodes,
    edges: storeState.edges,
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge(connection, get().edges),
      });
    },
    setNodes: (nodes) => {
      set({ nodes: typeof nodes === "function" ? nodes(get().nodes) : nodes });
    },
    setEdges: (edges) => {
      set({ edges: typeof edges === "function" ? edges(get().edges) : edges });
    },
  }));
};

export { createCanvasStore, type CanvasStoreState, type InitialCanvasStoreState };
