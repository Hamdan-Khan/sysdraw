import { Edge, Node, ReactFlowJsonObject, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";
import { CanvasStoreState } from "src/store";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

export const CANVAS_LOCALSTORAGE_KEY = "sysdraw-canvas-snapshot";

export const useCanvasStorage = (canvasState: StoreApi<CanvasStoreState>) => {
  const { nodes, edges, setEdges, setNodes } = useStore(canvasState, useShallow(selector));

  const { setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    const flow: ReactFlowJsonObject<Node, Edge> = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));
    toast("Snapshot saved!");
  }, [nodes, edges]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const stored = localStorage.getItem(CANVAS_LOCALSTORAGE_KEY);

      if (!stored) {
        toast("No stored snapshot found.");
        return;
      }

      try {
        const flow: ReactFlowJsonObject<Node, Edge> = JSON.parse(stored);
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
        toast("Snapshot restored!");
      } catch (e) {
        console.error(e);
        toast("Failed to restore snapshot.");
      }
    };

    restoreFlow();
  }, [setNodes, setEdges, setViewport]);

  return { onSave, onRestore };
};
