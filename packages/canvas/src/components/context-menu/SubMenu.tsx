import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { ContextMenuItem } from "./types";

const SUBMENU_WIDTH = 192;

interface SubMenuItemProps {
  item: ContextMenuItem;
  onClose: () => void;
}

/** a single row that may open a submenu on hover */
export const SubMenuItem = ({ item, onClose }: SubMenuItemProps) => {
  const [submenuStyle, setSubmenuStyle] = useState<React.CSSProperties | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const openSubmenu = () => {
    if (!item.submenu || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // open right unless there is not enough space, then flip left
    const spaceRight = vw - rect.right;
    const flipLeft = spaceRight < SUBMENU_WIDTH + 8;

    // vertical: clamp so submenu doesn't fall off the bottom of the viewport
    const submenuHeight = (item.submenu?.length ?? 0) * 36 + 8;
    const topOffset = rect.bottom + submenuHeight > vh ? -(submenuHeight - rect.height) : 0;

    setSubmenuStyle({
      position: "absolute",
      top: topOffset,
      ...(flipLeft ? { right: "100%" } : { left: "100%" }),
      width: SUBMENU_WIDTH,
      zIndex: 10000,
    });
  };

  const closeSubmenu = () => setSubmenuStyle(null);

  const hasSubmenu = Boolean(item.submenu?.length);

  return (
    <div ref={rowRef} className="relative" onMouseEnter={openSubmenu} onMouseLeave={closeSubmenu}>
      <button
        role="menuitem"
        disabled={item.disabled}
        onClick={() => {
          if (!hasSubmenu && !item.disabled && item.action) {
            item.action();
            onClose();
          } else if (hasSubmenu) {
            if (submenuStyle) closeSubmenu();
            else openSubmenu();
          }
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-primary hover:bg-dim disabled:text-secondary disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {item.checked !== undefined && (
            <span className="w-4 flex justify-center text-primary">{item.checked ? "✓" : ""}</span>
          )}
          {item.icon && <span className="text-secondary flex items-center">{item.icon}</span>}
          {item.label}
        </span>
        <span className="flex items-center gap-1">
          {item.shortcut && <kbd className="text-xs text-secondary font-mono">{item.shortcut}</kbd>}
          {hasSubmenu && <ChevronRight size={12} className="text-secondary" />}
        </span>
      </button>

      {hasSubmenu && submenuStyle && (
        <div
          style={submenuStyle}
          className="bg-surface border border-border rounded-lg shadow-xl py-1 overflow-hidden animate-context-menu"
          role="menu"
        >
          {item.submenu!.map((sub) => (
            <div key={sub.label}>
              {sub.divider && <div className="my-1 border-t border-border" />}
              <SubMenuItem item={sub} onClose={onClose} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
