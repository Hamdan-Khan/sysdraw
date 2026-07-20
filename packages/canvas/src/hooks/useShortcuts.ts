import { useCallback, useEffect, useState } from "react";
import { ContextMenuState } from "src/components/context-menu/types";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState } from "../store";
import { useCopyPaste } from "./useCopyPaste";

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
export function useShortcuts(canvasState: StoreApi<CanvasStoreState>) {
  const { copy, paste } = useCopyPaste();

  const { setNodes, setEdges } = useStore(canvasState, useShallow(selector));

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const selectAll = useCallback(() => {
    setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
    setEdges((prev) => prev.map((e) => ({ ...e, selected: true })));
  }, [setEdges, setNodes]);

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) {
        return;
      }

      const target = e.target as HTMLElement;
      // shoudn't trigger on editable elements
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case "c":
          copy();
          break;
        case "v":
          paste();
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
  }, [copy, paste, selectAll]);

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
