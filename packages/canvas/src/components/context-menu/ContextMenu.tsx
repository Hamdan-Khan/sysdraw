import { RegisteredEdges } from "@sysdraw/models";
import { Edge, MarkerType } from "@xyflow/react";
import { ArrowRight, ClipboardPaste, Copy, Maximize } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useCopyPaste, useHistory } from "../../hooks";
import { CanvasStoreState, useCanvasStore } from "../../store";
import { edgeTypeMetadata, edgeTypeOptions } from "../edges";
import { SubMenuItem } from "./SubMenu";
import { ContextMenuItem, ContextMenuState } from "./types";

const MENU_WIDTH = 192;

interface CanvasContextMenuProps {
  contextMenu: ContextMenuState | null;
  closeContextMenu: () => void;
}

const storeSelector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  globalEdgeType: state.globalEdgeType,
  setGlobalEdgeType: state.setGlobalEdgeType,
  globalEdgeAnimated: state.globalEdgeAnimated,
  setGlobalEdgeAnimated: state.setGlobalEdgeAnimated,
  globalEdgeMarkerEnd: state.globalEdgeMarkerEnd,
  setGlobalEdgeMarkerEnd: state.setGlobalEdgeMarkerEnd,
});

/**
 * context menu for the canvas
 */
export const CanvasContextMenu = ({ contextMenu, closeContextMenu }: CanvasContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { copy, paste, isClipboardEmpty } = useCopyPaste();
  const { commit } = useHistory();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    globalEdgeType,
    setGlobalEdgeType,
    globalEdgeAnimated,
    setGlobalEdgeAnimated,
    globalEdgeMarkerEnd,
    setGlobalEdgeMarkerEnd,
  } = useCanvasStore(useShallow(storeSelector));

  // close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };

    // use capture so we get the event before xyflow does
    document.addEventListener("mousedown", handleClick, true);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("mousedown", handleClick, true);
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [closeContextMenu]);

  const hasSelection = useMemo(() => nodes.some((n) => n.selected), [nodes]);

  const selectedEdges = useMemo(() => edges.filter((e) => e.selected), [edges]);

  const updateEdgeType = (type: RegisteredEdges) => {
    // if multiple nodes / edges are selected, update those specific elements,
    // otherwise update the edge type globally
    if (selectedEdges.length > 0) {
      commit();
      const selectedEdgeIds = new Set(selectedEdges.map((e) => e.id));
      setEdges((prev) => prev.map((e) => (selectedEdgeIds.has(e.id) ? { ...e, type } : e)));
    } else {
      setGlobalEdgeType(type);
    }
  };

  const updateEdgeAnimated = () => {
    if (selectedEdges.length > 0) {
      commit();
      const isCurrentlyAnimated = selectedEdges.every((e) => Boolean(e.animated));
      const nextState = !isCurrentlyAnimated;
      const selectedEdgeIds = new Set(selectedEdges.map((e) => e.id));
      setEdges((prev) =>
        prev.map((e) => (selectedEdgeIds.has(e.id) ? { ...e, animated: nextState } : e)),
      );
    } else {
      setGlobalEdgeAnimated(!globalEdgeAnimated);
    }
  };

  const updateEdgeMarkerEnd = (markerEnd?: Edge["markerEnd"]) => {
    if (selectedEdges.length > 0) {
      commit();
      const selectedEdgeIds = new Set(selectedEdges.map((e) => e.id));
      setEdges((prev) => prev.map((e) => (selectedEdgeIds.has(e.id) ? { ...e, markerEnd } : e)));
    } else {
      setGlobalEdgeMarkerEnd(markerEnd);
    }
  };

  if (!contextMenu) {
    return null;
  }

  const { x, y } = contextMenu;

  const arrowOptions = [
    { label: "None", value: undefined, typeStr: null },
    {
      label: "Closed Arrow",
      value: { type: MarkerType.ArrowClosed },
      typeStr: MarkerType.ArrowClosed,
    },
    { label: "Open Arrow", value: { type: MarkerType.Arrow }, typeStr: MarkerType.Arrow },
  ];

  const items: ContextMenuItem[] = [
    {
      label: "Copy",
      shortcut: "Ctrl + C",
      icon: Copy,
      disabled: !hasSelection,
      action: () => copy(),
    },
    {
      label: "Paste",
      shortcut: "Ctrl + V",
      icon: ClipboardPaste,
      disabled: isClipboardEmpty(),
      action: () => paste({ x, y }),
    },
    {
      label: "Select All",
      shortcut: "Ctrl + A",
      icon: Maximize,
      action: () => {
        setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
        setEdges((prev) => prev.map((e) => ({ ...e, selected: true })));
      },
    },
    {
      label: "Edge Type",
      divider: true,
      icon: edgeTypeMetadata[globalEdgeType].icon,
      submenu: edgeTypeOptions.map((opt) => {
        const isChecked =
          selectedEdges.length > 0
            ? selectedEdges.every((e) => e.type === opt.value)
            : globalEdgeType === opt.value;

        return {
          label: opt.label,
          icon: opt.icon,
          checked: isChecked,
          action: () => updateEdgeType(opt.value),
        };
      }),
    },
    {
      label: "Animated",
      checked:
        selectedEdges.length > 0
          ? selectedEdges.every((e) => Boolean(e.animated))
          : globalEdgeAnimated,
      action: () => updateEdgeAnimated(),
    },
    {
      label: "Arrow Head",
      icon: ArrowRight,
      submenu: arrowOptions.map((opt) => {
        const isChecked =
          selectedEdges.length > 0
            ? selectedEdges.every((e) => e.markerEnd === opt.typeStr)
            : globalEdgeMarkerEnd === opt.typeStr;

        return {
          label: opt.label,
          checked: isChecked,
          action: () => updateEdgeMarkerEnd(opt.value),
        };
      }),
    },
  ];

  // nudge the menu back inside the viewport if it would overflow
  const safeX = Math.min(x, window.innerWidth - MENU_WIDTH - 8);
  const safeY = Math.min(y, window.innerHeight - 16);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Canvas context menu"
      style={{ left: safeX, top: safeY }}
      className="fixed z-9999 w-48 origin-top-left"
    >
      <div className="bg-surface border border-border rounded-lg shadow-xl py-1 animate-context-menu">
        {items.map((item) => (
          <div key={item.label}>
            {item.divider && <div className="my-1 border-t border-border" />}
            <SubMenuItem item={item} onClose={closeContextMenu} />
          </div>
        ))}
      </div>
    </div>
  );
};
