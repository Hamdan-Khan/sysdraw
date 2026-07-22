import { useReactFlow, type Edge, type Node } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef } from "react";
import { useCanvasStore } from "../store";

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

/** module level clipboard reference */
const clipboardRef: { current: ClipboardData | null } = { current: null };

/** checks if internal clipboard is empty or has no nodes */
export function isClipboardEmpty(): boolean {
  return !clipboardRef.current || clipboardRef.current.nodes.length === 0;
}

/** clears the internal clipboard (useful for testing) */
export function clearClipboard(): void {
  clipboardRef.current = null;
}

/**
 * Custom hook for copy-paste functionality in the canvas.
 */
export function useCopyPaste() {
  const nodesMap = useCanvasStore((s) => s.nodesMap);
  const isNodeLocked = useCanvasStore((s) => s.isNodeLocked);
  const { getNodes, getEdges, setNodes, setEdges, screenToFlowPosition } = useReactFlow();
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  /** to add offset to pasted elements */
  const pasteCount = useRef(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      // clears offset
      pasteCount.current = 0;
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  /** copies selected nodes into an internal clipboard */
  const copy = useCallback(
    (explicitNodeId?: string) => {
      const allNodes = getNodes();
      const allEdges = getEdges();

      let nodesToCopy: Node[];
      if (explicitNodeId) {
        if (isNodeLocked(explicitNodeId)) {
          return;
        }
        const node = nodesMap.get(explicitNodeId);
        nodesToCopy = node ? [node] : allNodes.filter((n) => n.id === explicitNodeId);
      } else {
        nodesToCopy = allNodes.filter((n) => n.selected && !isNodeLocked(n.id));
      }

      if (nodesToCopy.length === 0) {
        return;
      }

      const idSet = new Set(nodesToCopy.map((n) => n.id));
      const edgesToCopy = allEdges.filter((e) => idSet.has(e.source) && idSet.has(e.target));

      // deep clone to avoid references to copied element's data
      clipboardRef.current = {
        nodes: structuredClone(nodesToCopy),
        edges: structuredClone(edgesToCopy),
      };

      // clear previous copy's references
      pasteCount.current = 0;
      lastMousePosition.current = null;
    },
    [getNodes, getEdges, nodesMap, isNodeLocked],
  );

  /**
   * pastes copied nodes into the canvas at the current mouse position
   * (or original position if none) with an offset
   */
  const paste = useCallback(
    (screenPosition?: { x: number; y: number }) => {
      const clipboard = clipboardRef.current;
      if (!clipboard || clipboard.nodes.length === 0) return;

      pasteCount.current += 1;

      // calculate of multi node selection's dimensions
      const minX = Math.min(...clipboard.nodes.map((n) => n.position.x));
      const minY = Math.min(...clipboard.nodes.map((n) => n.position.y));
      const maxX = Math.max(...clipboard.nodes.map((n) => n.position.x + (n.measured?.width ?? 0)));
      const maxY = Math.max(
        ...clipboard.nodes.map((n) => n.position.y + (n.measured?.height ?? 0)),
      );
      const width = maxX - minX;
      const height = maxY - minY;

      const anchor = screenPosition ?? lastMousePosition.current;

      let targetX: number;
      let targetY: number;

      if (anchor) {
        const flowPos = screenToFlowPosition(anchor);
        targetX = flowPos.x + width * pasteCount.current * 0.6;
        targetY = flowPos.y + height * pasteCount.current * 0.1;
      } else {
        // if no known cursor position, offset by the selection's own size
        targetX = minX + width * pasteCount.current * 0.6;
        targetY = minY + height * pasteCount.current * 0.1;
      }

      const dx = targetX - minX;
      const dy = targetY - minY;

      const idMap = new Map<string, string>();
      const newNodes = structuredClone(clipboard.nodes).map((n) => {
        const newId = nanoid();
        idMap.set(n.id, newId);
        n.id = newId;
        n.position.x += dx;
        n.position.y += dy;
        n.selected = true;
        return n;
      });
      const newEdges = structuredClone(clipboard.edges).map((e) => {
        e.id = nanoid();
        e.source = idMap.get(e.source)!;
        e.target = idMap.get(e.target)!;
        e.selected = true;
        return e;
      });

      setNodes((nds) =>
        nds.map((n) => (n.selected ? { ...n, selected: false } : n)).concat(newNodes),
      );
      setEdges((eds) =>
        eds.map((e) => (e.selected ? { ...e, selected: false } : e)).concat(newEdges),
      );
    },
    [screenToFlowPosition, setNodes, setEdges],
  );

  return { copy, paste, isClipboardEmpty };
}
