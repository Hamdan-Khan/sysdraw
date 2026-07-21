import { useCallback, useEffect, useState } from "react";
import { ContextMenuState } from "src/components/context-menu/types";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState, useCanvasStore } from "../store";
import { useCopyPaste } from "./useCopyPaste";
import { useHistory } from "./useHistory";

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

/**
 * hook to enable global keyboard shortcuts and a right-click context menu.
 *
 * should be called once at the root canvas level.
 */
export function useShortcuts() {
  const { copy, paste } = useCopyPaste();
  const { undo, redo, commit } = useHistory();

  const { nodes, edges, setNodes, setEdges } = useCanvasStore(useShallow(selector));

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const selectAll = useCallback(() => {
    setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
    setEdges((prev) => prev.map((e) => ({ ...e, selected: true })));
  }, [setEdges, setNodes]);

  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }

    commit();

    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

    setNodes((prev) => prev.filter((n) => !n.selected));
    setEdges((prev) =>
      prev.filter(
        (e) => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target),
      ),
    );
  }, [nodes, edges, commit, setNodes, setEdges]);

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // shoudn't trigger on editable elements
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // delete nodes
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
        return;
      }

      // rest are ctrl combinations
      if (!(e.ctrlKey || e.metaKey)) {
        return;
      }

      switch (e.key) {
        case "c":
          copy();
          break;
        case "v":
          paste();
          break;
        case "z":
          undo();
          break;
        case "y":
          redo();
          break;
        case "a":
          e.preventDefault();
          selectAll();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copy, paste, selectAll, undo, redo, deleteSelected]);

  // right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // only open on the canvas pane itself, not on overlaying UI controls
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-context-menu]")) return;

      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return { contextMenu, closeContextMenu };
}
