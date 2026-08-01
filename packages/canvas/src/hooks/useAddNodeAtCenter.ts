import { DnDTransferData } from "@/components/canvas/types";
import { isGroup } from "@/components/canvas/utils";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { NODE_WRAPPER_CLASS_ID } from "@sysdraw/common";
import { useLibraryRegistryStore } from "@sysdraw/models";
import { useReactFlow, type Node } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useCallback, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { createNodeData } from "./useCanvasHandlers";

const addNodeSelector = (state: CanvasStoreState) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  commit: state.commit,
});

/**
 * hook for adding a node at center of viewport from toolbar
 */
export const useAddNodeAtCenter = () => {
  const { setNodes, setEdges, commit } = useCanvasStore(
    useShallow(addNodeSelector),
  );
  const { screenToFlowPosition } = useReactFlow();
  const selectedLib = useLibraryRegistryStore((s) => s.selectedLib);

  const lastAddedNodeKeyRef = useRef<string | null>(null);
  const toolbarAddOffsetRef = useRef(0);

  const addNodeAtCenter = useCallback(
    (data: DnDTransferData) => {
      const { kind, id } = data;
      const currentKey = `${kind}:${id}`;

      if (lastAddedNodeKeyRef.current === currentKey) {
        toolbarAddOffsetRef.current += 1;
      } else {
        lastAddedNodeKeyRef.current = currentKey;
        toolbarAddOffsetRef.current = 0;
      }

      const centerScreen = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      const flowPos = screenToFlowPosition(centerScreen);

      const defaultWidth = kind === "group" ? 400 : 48;
      const defaultHeight = kind === "group" ? 300 : 48;

      const offset = toolbarAddOffsetRef.current * 20;
      const position = {
        x: flowPos.x - defaultWidth / 2 + offset,
        y: flowPos.y - defaultHeight / 2 + offset,
      };

      const allLibNodes = selectedLib?.nodes || [];
      const nodeDef = allLibNodes.find((n) => n.id === id);

      if (!nodeDef) {
        console.error(
          `Node definition for "${id}" not found in loaded libraries.`,
        );
        return;
      }

      const nodeData = createNodeData(kind, nodeDef);

      const newNode: Node = {
        id: nanoid(),
        type: id,
        position,
        data: nodeData,
        className: NODE_WRAPPER_CLASS_ID,
        selected: true,
      };

      commit();
      setNodes((prev) => {
        const deselected = prev.map((n) =>
          n.selected ? { ...n, selected: false } : n,
        );
        if (isGroup(newNode)) {
          return [newNode, ...deselected];
        }
        return [...deselected, newNode];
      });
      setEdges((prev) =>
        prev.map((e) => (e.selected ? { ...e, selected: false } : e)),
      );
    },
    [screenToFlowPosition, commit, setNodes, setEdges, selectedLib?.nodes],
  );

  return { addNodeAtCenter };
};
