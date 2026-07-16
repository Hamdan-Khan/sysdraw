import { ReactFlowInstance, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CanvasStoreState } from "src/store";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";

const selector = (state: CanvasStoreState) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

export const CANVAS_LOCALSTORAGE_KEY = "sysdraw-canvas-snapshot";

export const useCanvasStorage = (canvasState: StoreApi<CanvasStoreState>) => {
  const { setEdges, setNodes } = useStore(canvasState, useShallow(selector));

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));
      toast("Snapshot saved!");
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(CANVAS_LOCALSTORAGE_KEY) ?? "{}");

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
        toast("Snapshot restored!");
      }
    };

    restoreFlow();
  }, [setNodes, setEdges, setViewport]);

  return { rfInstance, setRfInstance, onSave, onRestore };
};
