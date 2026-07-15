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
import { toast } from "sonner";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState } from "../../store";
import { SYSDRAW_DRAG_DATA_FORMAT } from "../toolbar";
import { DnDTransferData } from "./types";
import {
  clampPositionInsideGroup,
  getIntersectingArea,
  getNodeRect,
  isChildNode,
  isGroup,
  NodeRect,
  sortNodesAndGroups,
} from "./utils";

const selector = (state: CanvasStoreState) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onConnect: state.onConnect,
});

/** minimum overlapping area percentage to trigger reparenting */
const MIN_OVERLAPPING_AREA = 0.25;

/**
 * event handlers for the canvas (drag, drop, re-parenting, etc.)
 */
export const useCanvasHandlers = (canvasState: StoreApi<CanvasStoreState>) => {
  const { setNodes, onConnect } = useStore(canvasState, useShallow(selector));

  const { screenToFlowPosition, getIntersectingNodes, getInternalNode, getNodesBounds, getNodes } =
    useReactFlow();

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

      const newNode: Node = { id: crypto.randomUUID(), type, position, data: defaultData };

      setNodes((prev) => {
        // xyflow requires parent nodes to be drawn before child nodes
        // hence, we add groups at the start when they're added from the toolbar
        if (isGroup(newNode)) {
          return [newNode, ...prev];
        }
        return [...prev, newNode];
      });
    },
    [screenToFlowPosition, setNodes],
  );

  /**
   * returns the group nodes that the node/group is intersecting with
   */
  const getIntersectingNodeGroup = useCallback(
    (node: Node) =>
      getIntersectingNodes(node).filter((n) => {
        if (!n.type) return false;
        return isGroup(n) && n.id !== node.id;
      }),
    [getIntersectingNodes],
  );

  /**
   * finds the best group drop target for a selection of nodes.
   *
   * the group with the highest overlap ratio against the selection is chosen.
   */
  const getBestDropGroup = useCallback(
    (nodes: Node[]): { group: Node; groupRect: NodeRect } | null => {
      /** bounding rect for the whole selection */
      const multiSelectDragBounds = nodes.length > 1 ? getNodesBounds(nodes) : null;

      const seen = new Set<string>();
      const candidateGroups: Node[] = [];
      // for every selected node: retrieves the group nodes it intersects with,
      // and adds them to candidate group
      for (const n of nodes) {
        for (const g of getIntersectingNodeGroup(n)) {
          // omit child groups from becoming candidates, because when child
          // group's area is large enough, it starts to trigger the min intersection
          // condition and be considered for the drag/drag stop events
          const isChild = isChildNode(n, g, getNodes());

          if (!seen.has(g.id) && !isChild) {
            seen.add(g.id);
            candidateGroups.push(g);
          }
        }
      }

      let bestGroup: Node | undefined;
      let bestGroupRect: NodeRect | undefined;
      let bestRatio = 0;

      // finds the group with the highest overlapping (with selected nodes) out of the candidates
      for (const candidate of candidateGroups) {
        const groupInternal = getInternalNode(candidate.id);
        if (!groupInternal) {
          continue;
        }
        const groupRect = getNodeRect(groupInternal);

        let overlapArea: number;
        let selectionArea: number;

        if (multiSelectDragBounds) {
          overlapArea = getIntersectingArea(multiSelectDragBounds, groupRect);
          selectionArea = multiSelectDragBounds.width * multiSelectDragBounds.height;
        } else {
          // resolve precise rect from internals (in case of a single node)
          const nodeInternal = getInternalNode(nodes[0].id);
          if (!nodeInternal) continue;
          const nodeRect = getNodeRect(nodeInternal);
          overlapArea = getIntersectingArea(nodeRect, groupRect);
          selectionArea = nodeRect.width * nodeRect.height;
        }

        const ratio = selectionArea !== 0 ? overlapArea / selectionArea : 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestGroup = candidate;
          bestGroupRect = groupRect;
        }
      }

      if (!bestGroup || !bestGroupRect || bestRatio < MIN_OVERLAPPING_AREA) return null;
      return { group: bestGroup, groupRect: bestGroupRect };
    },
    [getIntersectingNodeGroup, getInternalNode, getNodesBounds, getNodes],
  );

  /**
   * node drag for reparenting (highlight drop targets).
   *
   * in case of multi nodes selection, the entire selection is treated as a
   * single entity / node.
   */
  const onNodeDrag: OnNodeDrag<Node> = useCallback(
    (_e, node, nodes) => {
      const best = getBestDropGroup(nodes);

      if (nodes.length == 1) {
        const nodeArea = (node.measured?.height ?? 0) * (node.measured?.width ?? 0);
        const targetArea = (best?.groupRect.height ?? 0) * (best?.groupRect.width ?? 0);

        if (nodeArea > 0 && targetArea > 0 && nodeArea >= targetArea) {
          return;
        }
      }

      // apply / clear the drop-target highlight ring
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id === best?.group.id) {
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
    [getBestDropGroup, setNodes],
  );

  /**
   * node drag stop for reparenting (reparent / unparent).
   */
  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    (_e, node, nodes) => {
      const best = getBestDropGroup(nodes);

      if (nodes.length == 1) {
        const nodeArea = (node.measured?.height ?? 0) * (node.measured?.width ?? 0);
        const targetArea = (best?.groupRect.height ?? 0) * (best?.groupRect.width ?? 0);

        if (nodeArea > 0 && targetArea > 0 && nodeArea >= targetArea) {
          toast.error("Group is too small to contain the node");
          return;
        }
      }

      if (best) {
        const { group: dropTarget, groupRect } = best;

        // Reparent every selected node into the group.
        setNodes((ns) => {
          const updatedNodes = ns.map((n) => {
            // Clear the drop-target highlight ring.
            if (n.id === dropTarget.id) return { ...n, className: "" };

            // Only touch nodes that are part of the current drag selection.
            const isDragged = nodes.some((dn) => dn.id === n.id);
            if (!isDragged) return n;

            const nodeInternal = getInternalNode(n.id);
            if (!nodeInternal) return n;

            const nodeRect = getNodeRect(nodeInternal);
            const rawRelPos = { x: nodeRect.x - groupRect.x, y: nodeRect.y - groupRect.y };
            const position = clampPositionInsideGroup(
              rawRelPos,
              nodeRect.width,
              nodeRect.height,
              groupRect.width,
              groupRect.height,
            );
            return { ...n, position, parentId: dropTarget.id };
          });
          return sortNodesAndGroups(updatedNodes);
        });
      } else {
        // no valid drop target found so unparent every selected node that had a parent
        // then restore its absolute position and clean up any highlight rings.
        setNodes((ns) =>
          ns.map((n) => {
            if (n.className?.includes("ring-2")) return { ...n, className: "" };

            const isDragged = nodes.some((dn) => dn.id === n.id);
            if (!isDragged || !n.parentId) return n;

            const nodeInternal = getInternalNode(n.id);
            if (!nodeInternal) return n;

            return {
              ...n,
              position: nodeInternal.internals.positionAbsolute,
              parentId: undefined,
            };
          }),
        );
      }
    },
    [getBestDropGroup, getInternalNode, setNodes],
  );

  return { onDragOver, onDrop, onConnect, onNodeDrag, onNodeDragStop };
};
