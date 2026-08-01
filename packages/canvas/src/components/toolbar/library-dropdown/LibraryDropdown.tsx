import { Tooltip } from "@/components/common/Tooltip";
import { ConfirmDialog } from "@/components/controls/ConfirmDialog";
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
import { ChevronRight, Image, Plus, Trash2 } from "lucide-react";
import React, { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DropdownRow } from "./DropdownRow";
import { LibraryInfoDialog } from "./LibraryInfoDialog";

export interface LibraryDropdownProps {
  onSelectLibrary?: (id: string) => void;
  onOpenUploadDialog?: () => void;
}

const LibraryDropdownComponent = ({
  onSelectLibrary,
  onOpenUploadDialog,
}: LibraryDropdownProps) => {
  const registry = useLibraryRegistry();
  const selectedLib = useLibraryRegistryStore((state) => state.selectedLib);
  const localLibs = useLibraryRegistryStore((state) => state.localLibraries);

  const [builtinLibs, setBuiltinLibs] = useState<LibraryMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoLib, setInfoLib] = useState<LibraryMetadata | null>(null);
  const [deletingLib, setDeletingLib] = useState<LibraryMetadata | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isDialogOpenRef = useRef(false);

  // fetch remote libraries once on mount
  useEffect(() => {
    async function loadRemoteLibraries() {
      try {
        const all = await registry.listAllLibraries();
        const localIds = new Set(
          registry.getSnapshot().localLibraries.map((l) => l.id),
        );
        const remote = all.filter((l) => !localIds.has(l.id));
        setBuiltinLibs(remote);
      } catch (err) {
        console.error("Failed to load built-in libraries", err);
      } finally {
        setLoading(false);
      }
    }
    loadRemoteLibraries();
  }, [registry]);

  const handleDropdownOpenChange = (open: boolean) => {
    // if info or confirm dialog is open, ignore close events from the dropdown
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

  const handleDeleteLocalClick = (
    e: React.MouseEvent,
    lib: LibraryMetadata,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedLib?.id === lib.id) {
      toast.error(
        "Cannot delete selected library. Switch to another library before deleting it.",
      );
      return;
    }
    isDialogOpenRef.current = true;
    setDeletingLib(lib);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLib) return;
    const { id, name } = deletingLib;
    try {
      await registry.deleteLocalLibrary(id);
      toast.success(`Library "${name}" deleted.`);
    } catch (err) {
      console.error("Failed to delete library", err);
      toast.error("Failed to delete library.");
    } finally {
      setDeletingLib(null);
      isDialogOpenRef.current = false;
    }
  };

  const handleCloseDeleteConfirm = (open: boolean) => {
    if (!open) {
      setDeletingLib(null);
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
            <div className="flex items-center gap-2 min-w-0">
              <Image size={16} className="text-secondary shrink-0" />
              <span className="truncate">
                {selectedLib?.name || "Select library"}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-secondary shrink-0 transition-transform duration-150 group-data-popup-open:rotate-90 group-data-open:rotate-90"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-60 p-1.5 max-h-80 overflow-y-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center py-5 gap-2 text-xs text-secondary">
                <span>Loading...</span>
              </div>
            ) : (
              <>
                {/* built-in libraries section */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-1 text-[10px] uppercase tracking-wide text-secondary">
                    Built-in
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col gap-0.5">
                    {builtinLibs.length === 0 ? (
                      <div className="py-2 px-2.5 text-xs text-secondary italic">
                        No built-in libraries
                      </div>
                    ) : (
                      builtinLibs.map((lib) => (
                        <DropdownRow
                          key={lib.id}
                          lib={lib}
                          isLocal={false}
                          selectedLib={selectedLib}
                          handleSelectLibrary={handleSelectLibrary}
                          handleOpenInfo={handleOpenInfo}
                          handleDeleteLocal={handleDeleteLocalClick}
                        />
                      ))
                    )}
                  </div>
                </DropdownMenuGroup>

                {/* Local Section */}
                <DropdownMenuGroup className="mt-2">
                  <div className="flex items-center justify-between px-2.5 py-1">
                    <DropdownMenuLabel className="p-0 text-[10px] uppercase tracking-wide text-secondary">
                      Local
                    </DropdownMenuLabel>
                    {onOpenUploadDialog && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenUploadDialog();
                        }}
                        className="p-0.5 rounded text-secondary hover:text-primary hover:bg-dim cursor-pointer transition-colors"
                      >
                        <Tooltip text="Upload Local Library" />
                        <Plus size={13} />
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col gap-0.5">
                    {localLibs.length === 0 ? (
                      <div className="py-2 px-2.5 text-xs text-secondary italic">
                        No local libraries
                      </div>
                    ) : (
                      localLibs.map((lib) => (
                        <DropdownRow
                          key={lib.id}
                          lib={lib}
                          isLocal={true}
                          selectedLib={selectedLib}
                          handleSelectLibrary={handleSelectLibrary}
                          handleOpenInfo={handleOpenInfo}
                          handleDeleteLocal={handleDeleteLocalClick}
                        />
                      ))
                    )}
                  </div>
                </DropdownMenuGroup>
              </>
            )}
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

      {deletingLib && (
        <ConfirmDialog
          isOpen={!!deletingLib}
          onOpenChange={handleCloseDeleteConfirm}
          onConfirm={handleConfirmDelete}
          title="Delete Local Library"
          description={`Are you sure you want to delete "${deletingLib.name}"? This action cannot be undone.`}
          confirmText="Delete Library"
          icon={Trash2}
          variant="destructive"
        />
      )}
    </>
  );
};

export const LibraryDropdown = memo(LibraryDropdownComponent);
