import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LibraryMetadata,
  useLibraryRegistry,
  useLibraryRegistryStore,
} from "@sysdraw/models";
import { Check, ChevronRight, Image, Info, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "../common/Tooltip";
import { LibraryInfoDialog } from "./LibraryInfoDialog";

const LibraryThumbnail = ({ src, alt }: { src?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="size-6 rounded bg-dim border border-border flex items-center justify-center text-secondary shrink-0">
        <Package size={13} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="size-6 rounded object-contain border border-border/60 shrink-0 p-0.5 bg-dim"
    />
  );
};

export interface LibraryDropdownProps {
  onSelectLibrary?: (id: string) => void;
}

export const LibraryDropdown = ({ onSelectLibrary }: LibraryDropdownProps) => {
  const registry = useLibraryRegistry();
  const selectedLib = useLibraryRegistryStore((state) => state.selectedLib);

  const [libraries, setLibraries] = useState<LibraryMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoLib, setInfoLib] = useState<LibraryMetadata | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isDialogOpenRef = useRef(false);

  useEffect(() => {
    async function listLibraries() {
      try {
        const libs = await registry.listAllLibraries();
        setLibraries(libs);
      } catch (err) {
        console.error("Failed to load libraries list", err);
      } finally {
        setLoading(false);
      }
    }

    listLibraries();
  }, [registry]);

  const handleDropdownOpenChange = (open: boolean) => {
    // if info dialog is already open, we ignore close click events from the dropdown
    if (!open && isDialogOpenRef.current) {
      return;
    }
    setDropdownOpen(open);
  };

  const handleSelectLibrary = (id: string) => {
    setDropdownOpen(false);
    if (onSelectLibrary) {
      onSelectLibrary(id);
    } else {
      registry.selectLibrary(id);
    }
  };

  const handleOpenInfo = (e: React.MouseEvent, lib: LibraryMetadata) => {
    e.stopPropagation();
    e.preventDefault();
    isDialogOpenRef.current = true;
    setInfoLib(lib);
  };

  const handleCloseInfo = (open: boolean) => {
    if (!open) {
      setInfoLib(null);
      isDialogOpenRef.current = false;
    }
  };

  return (
    <>
      <div className="w-full px-4">
        <DropdownMenu
          open={dropdownOpen}
          onOpenChange={handleDropdownOpenChange}
        >
          <DropdownMenuTrigger
            type="button"
            aria-label="Libraries"
            className="group w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded border transition-all cursor-pointer bg-bg border-border text-primary hover:bg-surface/50 data-popup-open:bg-dim data-popup-open:border-primary data-open:bg-dim data-open:border-primary outline-none"
          >
            <div className="flex items-center gap-2">
              <Image size={16} className="text-secondary" />
              <span>{selectedLib?.name || "Select library"}</span>
            </div>
            <ChevronRight
              size={14}
              className="text-secondary transition-transform duration-150 group-data-popup-open:rotate-90 group-data-open:rotate-90"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-56 p-1.5"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2.5 py-1 text-[10px] uppercase tracking-wide text-secondary">
                Libraries
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto overflow-x-clip">
                {loading ? (
                  <div className="flex items-center justify-center py-5 gap-2 text-xs text-secondary">
                    <span>Loading...</span>
                  </div>
                ) : libraries.length === 0 ? (
                  <div className="py-4 text-center text-xs text-secondary">
                    No libraries available
                  </div>
                ) : (
                  libraries.map((lib) => {
                    const isSelected = selectedLib?.id === lib.id;
                    return (
                      <div
                        key={lib.id}
                        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-dim text-primary"
                        }`}
                        onClick={() => handleSelectLibrary(lib.id)}
                      >
                        {/* Selection indicator: checkmark when selected, spacer when not */}
                        <span className="size-3.5 shrink-0 flex items-center justify-center">
                          {isSelected && (
                            <Check
                              size={13}
                              strokeWidth={2.5}
                              className="text-primary"
                            />
                          )}
                        </span>

                        {/* Icon */}
                        <LibraryThumbnail src={lib.icon} alt={lib.name} />

                        {/* Label */}
                        <span className="flex-1 min-w-0 text-xs font-medium truncate">
                          {lib.name}
                        </span>

                        {/* Info button */}
                        <button
                          type="button"
                          aria-label={`View ${lib.name} info`}
                          onClick={(e) => handleOpenInfo(e, lib)}
                          className="opacity-0 group-hover:opacity-100 shrink-0 flex items-center justify-center size-5 rounded text-secondary hover:text-primary hover:bg-surface transition-all"
                        >
                          <Tooltip text="View Information" direction="up" />
                          <Info size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {infoLib && (
        <LibraryInfoDialog
          lib={infoLib}
          open={!!infoLib}
          onOpenChange={handleCloseInfo}
        />
      )}
    </>
  );
};
