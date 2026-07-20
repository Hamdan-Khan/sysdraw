import { RegisteredEdges } from "@sysdraw/models";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";

type InitialCanvasStoreState = {
  nodes: Node[];
  edges: Edge[];
  selectedEdgeType?: RegisteredEdges;
};

export interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

export interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

/** max number of history depth */
const HISTORY_LIMIT = 30;

interface CanvasStoreState {
  nodes: Node[];
  edges: Edge[];
  history: HistoryState;
  globalEdgeType: RegisteredEdges;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  setGlobalEdgeType: (type: RegisteredEdges) => void;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  isInteractive: boolean;
  setIsInteractive: (value: boolean) => void;
}

/**
 * create a canvas state store composed of nodes and edges.
 */
const createCanvasStore = (storeState: InitialCanvasStoreState) => {
  return create<CanvasStoreState>((set, get) => ({
    nodes: storeState.nodes,
    edges: storeState.edges,
    history: {
      past: [],
      future: [],
    },
    isInteractive: true,
    globalEdgeType: storeState.selectedEdgeType ?? RegisteredEdges.STRAIGHT,
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
    setGlobalEdgeType: (type) => set({ globalEdgeType: type }),
    setNodes: (nodes) => {
      set({ nodes: typeof nodes === "function" ? nodes(get().nodes) : nodes });
    },
    setEdges: (edges) => {
      set({ edges: typeof edges === "function" ? edges(get().edges) : edges });
    },
    commit: () => {
      const { history, nodes, edges } = get();
      set({
        // clear future list on change
        history: { future: [], past: [...history.past, { nodes, edges }].slice(-HISTORY_LIMIT) },
      });
    },
    undo: () => {
      const { nodes, edges, history } = get();
      const { past, future } = history;
      if (past.length === 0) {
        return;
      }
      const previous = past[past.length - 1];
      set({
        nodes: previous.nodes,
        edges: previous.edges,
        history: { past: past.slice(0, past.length - 1), future: [{ nodes, edges }, ...future] },
      });
    },
    redo: () => {
      const { past, future } = get().history;
      if (future.length === 0) {
        return;
      }
      const next = future[0];
      set({
        nodes: next.nodes,
        edges: next.edges,
        history: { past: [...past, next], future: future.slice(1) },
      });
    },
    setIsInteractive: (value) => set({ isInteractive: value }),
  }));
};

export { createCanvasStore, type CanvasStoreState, type InitialCanvasStoreState };
