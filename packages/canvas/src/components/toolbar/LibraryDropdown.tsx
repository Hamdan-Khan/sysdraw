import { LibraryMetadata, useLibraryRegistry, useLibraryRegistryStore } from "@sysdraw/models";
import { Check, ChevronRight, Image } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const LibraryDropdown = () => {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const registry = useLibraryRegistry();
  const loadedLibs = useLibraryRegistryStore((state) => state.loadedLibs);

  const libraries: LibraryMetadata[] = registry.listAllLibraries();
  const selectedCount = Object.keys(loadedLibs).length;

  const positionPanel = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    // position panel to the right of the toolbar trigger button
    const left = rect.right + 8;
    const spaceBelow = vh - rect.top;
    const openDown = spaceBelow > 200;
    const top = openDown ? rect.top : Math.max(8, rect.bottom - 200);

    setPanelStyle({
      position: "fixed",
      top,
      left,
      minWidth: 200,
      zIndex: 9999,
    });
  };

  const toggleOpen = () => {
    if (!open) positionPanel();
    setOpen((prev) => !prev);
  };

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

  // todo: handle when converted to promise
  const toggleLibrary = (id: string) => {
    if (loadedLibs[id]) {
      registry.removeLibrary(id);
    } else {
      registry.addLibrary(id);
    }
  };

  const panel = open && (
    <div
      ref={panelRef}
      style={panelStyle}
      className="bg-surface border border-border rounded-lg shadow-xl py-2 px-1 text-text animate-context-menu"
      role="menu"
      aria-label="Select Libraries"
    >
      <div className="px-3 py-1 text-xs font-semibold text-secondary uppercase tracking-wider border-b border-border mb-1">
        Libraries ({selectedCount}/{libraries.length})
      </div>
      <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
        {libraries.map((lib) => {
          const isSelected = Boolean(loadedLibs[lib.id]);
          return (
            <button
              key={lib.id}
              type="button"
              role="menuitemcheckbox"
              aria-checked={isSelected}
              onClick={() => toggleLibrary(lib.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-xs rounded transition-colors cursor-pointer text-left ${
                isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-dim text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-primary border-primary text-bg"
                      : "border-border bg-bg group-hover:border-secondary"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{lib.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="px-4">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-label="Libraries"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
          open
            ? "bg-dim border-primary text-primary"
            : "bg-bg border-border text-primary hover:bg-surface/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <Image size={16} className="text-secondary" />
          <span>Icon Pack</span>
          {selectedCount > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronRight
          size={14}
          className={`text-secondary transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {panel && createPortal(panel, document.body)}
    </div>
  );
};
