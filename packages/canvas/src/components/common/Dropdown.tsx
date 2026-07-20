import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

interface DropdownProps<T extends string = string> {
  id?: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** direction the panel opens relative to trigger; auto-flips if near edge */
  preferredDirection?: "down" | "up";
  "aria-label"?: string;
}

const PANEL_WIDTH = 176; // 11rem

export const Dropdown = <T extends string>({
  id,
  options,
  value,
  onChange,
  preferredDirection = "down",
  "aria-label": ariaLabel,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const SelectedIcon = selected?.icon;

  const positionPanel = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // horizontal: align left edge of panel with trigger, clamp to viewport
    const left = Math.min(rect.left, vw - PANEL_WIDTH - 8);

    // vertical: open down unless there is not enough space, then flip up
    const spaceBelow = vh - rect.bottom;
    const openDown = preferredDirection === "down" ? spaceBelow > 160 : spaceBelow > 160;
    const top = openDown ? rect.bottom + 4 : rect.top - 4;
    const transform = openDown ? "none" : "translateY(-100%)";

    setPanelStyle({ position: "fixed", top, left, width: PANEL_WIDTH, transform, zIndex: 9999 });
  };

  const toggleOpen = () => {
    if (!open) positionPanel();
    setOpen((prev) => !prev);
  };

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Element) &&
        (!panelRef.current || !panelRef.current.contains(e.target as Element))
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick, true);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("mousedown", handleClick, true);
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [open]);

  const panel = open && (
    <div
      ref={panelRef}
      style={panelStyle}
      className="bg-surface border border-border rounded-lg shadow-xl py-1 overflow-hidden animate-context-menu"
      role="listbox"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="option"
            aria-selected={isActive}
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-dim transition-colors cursor-pointer"
          >
            <span className="w-3 shrink-0 flex justify-center text-primary">
              {isActive && <Check size={12} />}
            </span>
            {Icon && <Icon size={14} className="text-secondary shrink-0" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex items-center justify-center">
      <button
        ref={triggerRef}
        id={id}
        onClick={toggleOpen}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1 p-2 rounded-md transition-all cursor-pointer outline-none ${
          open ? "text-primary bg-dim" : "text-secondary hover:text-primary hover:bg-dim"
        }`}
      >
        {SelectedIcon && <SelectedIcon size={16} />}
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {panel && createPortal(panel, document.body)}
    </div>
  );
};
