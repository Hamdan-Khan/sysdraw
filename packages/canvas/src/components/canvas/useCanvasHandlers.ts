import {
  BaseGroupData,
  BaseNodeData,
  defaultGroupsMap,
  defaultNodesMap,
  RegisteredGroups,
  RegisteredNodes,
} from "@sysdraw/models";
import { Node, OnNodeDrag, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState } from "../../store";
import { SYSDRAW_DRAG_DATA_FORMAT } from "../toolbar";
import { DnDTransferData } from "./types";
import { clampPositionInsideGroup, getIntersectingArea, getNodeRect } from "./utils";

const selector = (state: CanvasStoreState) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onConnect: state.onConnect,
});

/**
 * event handlers for the canvas (drag, drop, re-parenting, etc.)
 */
export const useCanvasHandlers = (canvasState: StoreApi<CanvasStoreState>) => {
  const { setNodes, onConnect } = useStore(canvasState, useShallow(selector));

  const { screenToFlowPosition, getIntersectingNodes, getInternalNode } = useReactFlow();

  /**
   * drag over (from toolbar)
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /**
   * drop from toolbar into canvas
   */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData(SYSDRAW_DRAG_DATA_FORMAT);

      if (!raw) {
        console.error("No drag n drop data (e.dataTransfer) found.");
        return;
      }

      const { kind, type }: DnDTransferData = JSON.parse(raw);

      // screenToFlowPosition converts client (screen) coords straight to
      // flow coords, accounting for pan/zoom
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      let defaultData: BaseNodeData | BaseGroupData;

      if (kind === "node") {
        defaultData = defaultNodesMap[type as RegisteredNodes];
      } else {
        defaultData = defaultGroupsMap[type as RegisteredGroups];
      }

      if (!defaultData) {
        console.error(`Error getting the default data for the node "${type}" and kind "${kind}"`);
        return;
      }

      setNodes((prev) => [...prev, { id: crypto.randomUUID(), type, position, data: defaultData }]);
    },
    [screenToFlowPosition, setNodes],
  );

  /**
   * returns the group nodes that the node is intersecting with
   */
  const getIntersectingNodeGroup = useCallback(
    (node: Node) =>
      getIntersectingNodes(node).filter((n) => {
        if (!n.type) return false;
        const isGroup = Object.values(RegisteredGroups).includes(n.type as RegisteredGroups);
        return isGroup && n.id !== node.id;
      }),
    [getIntersectingNodes],
  );

  /**
   * node drag for reparenting (highlight drop targets)
   */
  const onNodeDrag: OnNodeDrag<Node> = useCallback(
    (_e, node) => {
      const group = getIntersectingNodeGroup(node)[0];
      let area = 0;

      if (group) {
        const nodeInternal = getInternalNode(node.id);
        const groupInternal = getInternalNode(group.id);
        if (!nodeInternal || !groupInternal) return;
        area = getIntersectingArea(getNodeRect(nodeInternal), getNodeRect(groupInternal));
      }

      const nodeArea = (node.measured?.width ?? 0) * (node.measured?.height ?? 0);
      const isIntersectingEnough = nodeArea !== 0 ? area / nodeArea >= 0.25 : false;

      // apply / clear the drop-target highlight ring
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id === group?.id && isIntersectingEnough) {
            return {
              ...n,
              className: "ring-2 ring-primary bg-primary/5 rounded-xl transition-all",
            };
          }
          if (n.className?.includes("ring-2")) {
            return { ...n, className: "" };
          }
          return n;
        }),
      );
    },
    [getIntersectingNodeGroup, setNodes, getInternalNode],
  );

  /**
   * node drag stop for reparenting (reparent / unparent)
   */
  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    (_e, node) => {
      const dropTarget = getIntersectingNodeGroup(node)[0];

      if (dropTarget) {
        const nodeInternal = getInternalNode(node.id);
        const groupInternal = getInternalNode(dropTarget.id);
        if (!nodeInternal || !groupInternal) return;

        const nodeRect = getNodeRect(nodeInternal);
        const groupRect = getNodeRect(groupInternal);
        const area = getIntersectingArea(nodeRect, groupRect);
        const nodeArea = nodeRect.width * nodeRect.height;
        const isIntersectingEnough = nodeArea !== 0 ? area / nodeArea >= 0.25 : false;

        if (isIntersectingEnough) {
          // reparent the node into the group
          setNodes((ns) =>
            ns.map((n) => {
              if (n.id === dropTarget.id) {
                // clear the drop target highlight
                return { ...n, className: "" };
              }
              if (n.id === node.id) {
                const rawRelPos = { x: nodeRect.x - groupRect.x, y: nodeRect.y - groupRect.y };
                const position = clampPositionInsideGroup(
                  rawRelPos,
                  nodeRect.width,
                  nodeRect.height,
                  groupRect.width,
                  groupRect.height,
                );
                return { ...n, position, parentId: dropTarget.id };
              }
              return n;
            }),
          );
        } else {
          // clear styles and strip any existing parent
          setNodes((ns) =>
            ns.map((n) => {
              if (n.className?.includes("ring-2")) return { ...n, className: "" };
              if (n.id === node.id) {
                return {
                  ...n,
                  position: nodeInternal.internals.positionAbsolute,
                  parentId: undefined,
                };
              }
              return n;
            }),
          );
        }
      } else {
        // unparent if it is dropped into a empty canvas
        if (node.parentId) {
          setNodes((ns) =>
            ns.map((n) => {
              const nodeInternal = getInternalNode(node.id);
              if (n.id === node.id && nodeInternal) {
                return {
                  ...n,
                  position: nodeInternal.internals.positionAbsolute,
                  parentId: undefined,
                };
              }
              if (n.className?.includes("ring-2")) return { ...n, className: "" };
              return n;
            }),
          );
        } else {
          // clean up any stale highlight rings
          setNodes((ns) =>
            ns.map((n) => (n.className?.includes("ring-2") ? { ...n, className: "" } : n)),
          );
        }
      }
    },
    [getIntersectingNodeGroup, getInternalNode, setNodes],
  );

  return { onDragOver, onDrop, onConnect, onNodeDrag, onNodeDragStop };
};
