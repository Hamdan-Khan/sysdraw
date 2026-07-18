import { ClipboardPaste, Copy, Maximize } from "lucide-react";
import { useEffect, useRef } from "react";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useCopyPaste, useShortcuts } from "../../hooks";
import { CanvasStoreState } from "../../store";

export interface ContextMenuItem {
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
  /** renders a separator line above this item */
  divider?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu = ({ x, y, items, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // use capture so we get the event before xyflow does
    document.addEventListener("mousedown", handleClick, true);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("mousedown", handleClick, true);
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [onClose]);

  // nudge the menu back inside the viewport if it would overflow
  const safeX = Math.min(x, window.innerWidth - 192);
  const safeY = Math.min(y, window.innerHeight - 16);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Canvas context menu"
      style={{ left: safeX, top: safeY }}
      className="fixed z-9999 w-48 origin-top-left"
    >
      <div className="bg-surface border border-border rounded-lg shadow-xl py-1 overflow-hidden animate-context-menu">
        {items.map((item) => (
          <div key={item.label}>
            {item.divider && <div className="my-1 border-t border-border" />}
            <button
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-primary hover:bg-dim disabled:text-secondary disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {item.icon && <span className="text-secondary flex items-center">{item.icon}</span>}
                {item.label}
              </span>
              {item.shortcut && (
                <kbd className="text-xs text-secondary font-mono">{item.shortcut}</kbd>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const storeSelector = (state: CanvasStoreState) => ({
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

interface CanvasContextMenuProps {
  canvasState: StoreApi<CanvasStoreState>;
}

/**
 * context menu for the canvas
 */
export const CanvasContextMenu = ({ canvasState }: CanvasContextMenuProps) => {
  const { contextMenu, closeContextMenu } = useShortcuts(canvasState);
  const { copy, paste } = useCopyPaste();
  const { setNodes, setEdges } = useStore(canvasState, useShallow(storeSelector));

  if (!contextMenu) return null;

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
  ];

  return <ContextMenu x={x} y={y} items={items} onClose={closeContextMenu} />;
};
