import { useLibraryRegistry } from "@sysdraw/models";
import { Edge, Node, ReactFlowJsonObject, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState, useCanvasStore } from "../store";

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

export const CANVAS_LOCALSTORAGE_KEY = "sysdraw-canvas-snapshot";

export const useCanvasStorage = () => {
  const { nodes, edges, setEdges, setNodes } = useCanvasStore(useShallow(selector));
  const reactFlowInstance = useReactFlow();
  const libraryRegistry = useLibraryRegistry();

  const isRestoredRef = useRef(false);

  const onSave = useCallback(() => {
    const flow: ReactFlowJsonObject<Node, Edge> = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));
  }, [nodes, edges]);

  // auto restore on mount after library registry is ready
  useEffect(() => {
    let isCancelled = false;

    const performAutoRestore = async () => {
      if (isRestoredRef.current) return;

      if (libraryRegistry) {
        try {
          await libraryRegistry.whenReady();
        } catch (e) {
          console.error("Library Registry failed to load:", e);
        }
      }

      if (isCancelled || isRestoredRef.current) return;
      isRestoredRef.current = true;

      const stored = localStorage.getItem(CANVAS_LOCALSTORAGE_KEY);
      if (stored) {
        try {
          const flow: ReactFlowJsonObject<Node, Edge> = JSON.parse(stored);
          if (flow.nodes || flow.edges) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (reactFlowInstance?.setViewport) {
              reactFlowInstance.setViewport({ x, y, zoom });
            }
          }
        } catch (e) {
          console.error("Auto restore failed:", e);
          toast("Failed to restore snapshot.");
        }
      }
    };

    performAutoRestore();

    return () => {
      isCancelled = true;
    };
  }, [setNodes, setEdges, reactFlowInstance, libraryRegistry]);

  // debounced auto save whenever nodes or edges change
  useEffect(() => {
    if (!isRestoredRef.current) return;

    const timer = setTimeout(() => {
      onSave();
    }, 300);

    return () => clearTimeout(timer);
  }, [nodes, edges, onSave]);

  return { onSave };
};
