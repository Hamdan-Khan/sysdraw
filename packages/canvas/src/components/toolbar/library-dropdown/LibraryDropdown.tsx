import { Tooltip } from "@/components/common/Tooltip";
import { ConfirmDialog } from "@/components/controls/ConfirmDialog";
import { Button, DropdownMenu } from "@cloudflare/kumo";
import {
  LibraryMetadata,
  useLibraryRegistry,
  useLibraryRegistryStore,
} from "@zero-sketch/models";
import { ChevronRight, Image, Plus, Trash2 } from "lucide-react";
import React, { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DropdownRow } from "./DropdownRow";
import { LibraryInfoDialog } from "./LibraryInfoDialog";

export interface LibraryDropdownProps {
  onSelectLibrary: (id: string) => void;
  onOpenUploadDialog: () => void;
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
      }
      setLoading(false);
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
    onSelectLibrary(id);
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
    }
    setDeletingLib(null);
    isDialogOpenRef.current = false;
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
          <DropdownMenu.Trigger
            render={
              <Button
                variant="secondary"
                size="base"
                aria-label="Libraries"
                className="group w-full flex items-center justify-between gap-2 text-sm font-medium"
              />
            }
          >
            <div className="flex items-center gap-2 min-w-0">
              {selectedLib?.icon ? (
                <img
                  src={selectedLib.icon}
                  alt={selectedLib.name}
                  className="size-4 shrink-0"
                />
              ) : (
                <Image size={16} className="text-secondary shrink-0" />
              )}
              <span className="truncate">
                {selectedLib?.name || "Select library"}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-secondary shrink-0 transition-transform duration-150"
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            side="right"
            align="start"
            sideOffset={8}
            className="w-60 max-h-80 overflow-y-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center py-5 gap-2 text-xs text-kumo-subtle">
                <span>Loading...</span>
              </div>
            ) : (
              <>
                {/* built-in libraries section */}
                <DropdownMenu.Group>
                  <DropdownMenu.Label className="text-sm">
                    Built-in
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  {builtinLibs.length === 0 ? (
                    <div className="py-2 px-2.5 text-xs text-kumo-subtle">
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
                </DropdownMenu.Group>

                {/* Local Section */}
                <DropdownMenu.Group className="mt-2">
                  <DropdownMenu.Separator />
                  <div className="flex items-center justify-between px-2.5 py-1">
                    <DropdownMenu.Label className="px-0 text-sm">
                      Local
                    </DropdownMenu.Label>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenUploadDialog();
                      }}
                      className="p-0.5 rounded text-kumo-subtle hover:text-kumo-default hover:bg-kumo-tint cursor-pointer transition-colors"
                    >
                      <Tooltip text="Upload Local Library" />
                      <Plus size={13} />
                    </button>
                  </div>
                  <DropdownMenu.Separator />
                  {localLibs.length === 0 ? (
                    <div className="py-2 px-2.5 text-xs text-kumo-subtle">
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
                </DropdownMenu.Group>
              </>
            )}
          </DropdownMenu.Content>
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
