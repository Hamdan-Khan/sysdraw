import { RegisteredEdges } from "@sysdraw/models";
import {
  ClipboardPaste,
  Copy,
  CornerDownRight,
  GitCommit,
  Maximize,
  Minus,
  Spline,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useCopyPaste, useShortcuts } from "../../hooks";
import { CanvasStoreState } from "../../store";
import { edgeTypeMetadata } from "../edges";
import { SubMenuItem } from "./SubMenu";
import { ContextMenuItem } from "./types";

const MENU_WIDTH = 192;

interface CanvasContextMenuProps {
  canvasState: StoreApi<CanvasStoreState>;
}

const edgeTypeOptions: { value: RegisteredEdges; label: string; icon: React.ReactNode }[] = [
  { value: RegisteredEdges.STRAIGHT, label: "Straight", icon: <Minus size={14} /> },
  { value: RegisteredEdges.STEP, label: "Step", icon: <CornerDownRight size={14} /> },
  { value: RegisteredEdges.SMOOTHSTEP, label: "Smooth Step", icon: <GitCommit size={14} /> },
  { value: RegisteredEdges.BEZIER, label: "Bezier", icon: <Spline size={14} /> },
];

const storeSelector = (state: CanvasStoreState) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  globalEdgeType: state.globalEdgeType,
  setGlobalEdgeType: state.setGlobalEdgeType,
});

/**
 * context menu for the canvas
 */
export const CanvasContextMenu = ({ canvasState }: CanvasContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { contextMenu, closeContextMenu } = useShortcuts(canvasState);
  const { copy, paste } = useCopyPaste();
  const { setNodes, setEdges, globalEdgeType, setGlobalEdgeType } = useStore(
    canvasState,
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

  if (!contextMenu) {
    return null;
  }

  const { x, y } = contextMenu;

  const items: ContextMenuItem[] = [
    {
      label: "Copy",
      shortcut: "Ctrl + C",
      icon: <Copy size={14} />,
      action: () => copy(),
    },
    {
      label: "Paste",
      shortcut: "Ctrl + V",
      icon: <ClipboardPaste size={14} />,
      action: () => paste({ x, y }),
    },
    {
      label: "Select All",
      shortcut: "Ctrl + A",
      icon: <Maximize size={14} />,
      divider: true,
      action: () => {
        setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
        setEdges((prev) => prev.map((e) => ({ ...e, selected: true })));
      },
    },
    {
      label: "Edge Type",
      divider: true,
      icon: (() => {
        const Icon = edgeTypeMetadata[globalEdgeType].icon;
        return <Icon size={14} />;
      })(),
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
