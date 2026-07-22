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

const createNodesMap = (nodes: Node[]): Map<string, Node> =>
  new Map(nodes.map((n) => [n.id, n]));

interface CanvasStoreState {
  nodes: Node[];
  nodesMap: Map<string, Node>;
  edges: Edge[];
  history: HistoryState;
  globalEdgeType: RegisteredEdges;
  globalEdgeAnimated: boolean;
  globalEdgeMarkerEnd: Edge["markerEnd"];
  isInteractive: boolean;
  grid: boolean;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  setIsInteractive: (value: boolean) => void;
  setGlobalEdgeType: (type: RegisteredEdges) => void;
  setGlobalEdgeAnimated: (animated: boolean) => void;
  setGlobalEdgeMarkerEnd: (markerEnd?: Edge["markerEnd"]) => void;
  setGrid: (value: boolean) => void;
}

/**
 * create a canvas state store composed of nodes and edges.
 */
const createCanvasStore = (storeState: InitialCanvasStoreState) => {
  return create<CanvasStoreState>((set, get) => ({
    nodes: storeState.nodes,
    nodesMap: createNodesMap(storeState.nodes),
    edges: storeState.edges,
    history: {
      past: [],
      future: [],
    },
    isInteractive: true,
    globalEdgeType: storeState.selectedEdgeType ?? RegisteredEdges.STRAIGHT,
    globalEdgeAnimated: false,
    globalEdgeMarkerEnd: undefined,
    grid: true,
    onNodesChange: (changes) => {
      const nextNodes = applyNodeChanges(changes, get().nodes);
      set({
        nodes: nextNodes,
        nodesMap: createNodesMap(nextNodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    setNodes: (nodes) => {
      const nextNodes = typeof nodes === "function" ? nodes(get().nodes) : nodes;
      set({
        nodes: nextNodes,
        nodesMap: createNodesMap(nextNodes),
      });
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
        nodesMap: createNodesMap(previous.nodes),
        edges: previous.edges,
        history: { past: past.slice(0, past.length - 1), future: [{ nodes, edges }, ...future] },
      });
    },
    redo: () => {
      const { nodes, edges, history } = get();
      const { past, future } = history;
      if (future.length === 0) {
        return;
      }
      const next = future[0];
      set({
        nodes: next.nodes,
        nodesMap: createNodesMap(next.nodes),
        edges: next.edges,
        history: { past: [...past, { nodes, edges }], future: future.slice(1) },
      });
    },
    setIsInteractive: (value) => set({ isInteractive: value }),
    setGlobalEdgeType: (type) => set({ globalEdgeType: type }),
    setGlobalEdgeAnimated: (animated) => set({ globalEdgeAnimated: animated }),
    setGlobalEdgeMarkerEnd: (markerEnd) => set({ globalEdgeMarkerEnd: markerEnd }),
    setGrid: (value) => set({ grid: value }),
  }));
};

export { createCanvasStore, type CanvasStoreState, type InitialCanvasStoreState };
