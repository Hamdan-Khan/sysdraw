import { ClipboardPaste, Copy, Maximize } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useCopyPaste } from "../../hooks";
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
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  globalEdgeType: state.globalEdgeType,
  setGlobalEdgeType: state.setGlobalEdgeType,
});

/**
 * context menu for the canvas
 */
export const CanvasContextMenu = ({ contextMenu, closeContextMenu }: CanvasContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { copy, paste, isClipboardEmpty } = useCopyPaste();
  const { nodes, setNodes, setEdges, globalEdgeType, setGlobalEdgeType } = useCanvasStore(
    useShallow(storeSelector),
  );

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

  if (!contextMenu) {
    return null;
  }

  const { x, y } = contextMenu;

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
        return {
          label: opt.label,
          icon: opt.icon,
          checked: globalEdgeType === opt.value,
          action: () => setGlobalEdgeType(opt.value),
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
