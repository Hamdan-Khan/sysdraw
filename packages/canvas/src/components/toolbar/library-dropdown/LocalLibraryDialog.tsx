import { LibraryManifestSchema } from "@/lib/import/librarySchemas";
import { sanitizeSvgString } from "@/lib/sanitizeSvg";
import { Button, Dialog, LinkButton } from "@cloudflare/kumo";
import {
  LibraryManifest,
  LibraryMetadata,
  useLibraryRegistry,
} from "@zero-sketch/models";
import { AlertTriangle, ExternalLink, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export interface LocalLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const LocalLibraryDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: LocalLibraryDialogProps) => {
  const registry = useLibraryRegistry();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [pendingManifest, setPendingManifest] =
    useState<LibraryManifest | null>(null);
  const [conflictLib, setConflictLib] = useState<LibraryMetadata | null>(null);

  /** resets the conflict dialog and states */
  const handleReset = () => {
    setPendingManifest(null);
    setConflictLib(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  const processManifest = async (manifest: LibraryManifest, force = false) => {
    setIsLoading(true);
    try {
      // sanitize SVG icons in nodes
      const sanitizedNodes = manifest.nodes.map((node) => {
        if (node.icon?.kind === "svg" && node.icon.value) {
          return {
            ...node,
            icon: {
              ...node.icon,
              value: sanitizeSvgString(node.icon.value),
            },
          };
        }
        return node;
      });

      const sanitizedManifest: LibraryManifest = {
        ...manifest,
        nodes: sanitizedNodes,
      };

      const result = await registry.addLocalLibrary(sanitizedManifest, force);

      if (result.success) {
        toast.success(
          `Library "${sanitizedManifest.name}" added successfully.`,
        );
        await registry.selectLibrary(sanitizedManifest.id);
        onSuccess?.();
        handleClose(false);
      } else if (result.conflict) {
        setPendingManifest(sanitizedManifest);
        setConflictLib(result.conflict);
      }
    } catch (err) {
      console.error("Failed to add library", err);
      toast.error("An unexpected error occurred while adding the library.");
    }
    setIsLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);

      const parseResult = LibraryManifestSchema.safeParse(rawJson);
      if (!parseResult.success) {
        const firstError =
          parseResult.error.issues[0]?.message || "Invalid JSON schema";
        toast.error(`Invalid library file: ${firstError}`);
        return;
      }

      await processManifest(parseResult.data);
    } catch (err) {
      console.error("Failed to parse library file", err);
      toast.error(
        "Failed to parse JSON file. Please make sure it is valid JSON.",
      );
    }
  };

  const handleReplaceConfirm = async () => {
    if (!pendingManifest) {
      return;
    }
    await processManifest(pendingManifest, true);
  };

  return (
    <>
      <Dialog.Root open={open && !conflictLib} onOpenChange={handleClose}>
        <Dialog size="base" className="z-50 p-6">
          <div className="mb-3 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold">
              Add a Custom Library
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              render={(props) => (
                <Button
                  {...props}
                  variant="secondary"
                  shape="square"
                  size="sm"
                  icon={<X className="size-4" />}
                  aria-label="Close"
                />
              )}
            />
          </div>
          <Dialog.Description className="text-sm text-kumo-subtle">
            Create your own icon library with our Library Builder or upload an
            existing library file.
          </Dialog.Description>

          <div className="flex flex-col gap-4 py-2">
            <div className="w-full border-t border-border my-0.5" />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-kumo-subtle mb-2">
                Build custom icon sets and export lightweight library files for
                local use.
              </p>
              <LinkButton
                href="/libraries"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="base"
                className="w-full no-underline justify-center"
                icon={<ExternalLink className="size-3.5" />}
              >
                <span>Build a Library</span>
              </LinkButton>
            </div>

            <div className="relative flex items-center justify-center my-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative px-2.5 bg-white text-kumo-subtle text-xs uppercase font-bold">
                or upload an existing file
              </span>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="local-library-file-input"
              />
              <Button
                type="button"
                variant="secondary"
                size="base"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-center"
                icon={<Upload className="size-3.5" />}
              >
                <span>
                  {isLoading
                    ? "Processing Library..."
                    : "Upload Library (.json)"}
                </span>
              </Button>
            </div>
          </div>
        </Dialog>
      </Dialog.Root>

      {/* conflict dialog */}
      <Dialog.Root
        role="alertdialog"
        open={!!conflictLib}
        onOpenChange={(o) => !o && handleReset()}
      >
        <Dialog size="base" className="z-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="size-5 text-kumo-danger" />
            <Dialog.Title className="text-xl font-semibold">
              Warning
            </Dialog.Title>
          </div>
          <Dialog.Description className="text-kumo-subtle text-sm">
            A library named <strong>"{conflictLib?.name}"</strong> (v
            {conflictLib?.version}) already exists in your workspace. Replacing
            it will overwrite the library definition stored locally on your
            device.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close
              render={(props) => (
                <Button
                  variant="secondary"
                  size="sm"
                  {...props}
                  onClick={handleReset}
                >
                  Cancel
                </Button>
              )}
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoading}
              onClick={handleReplaceConfirm}
            >
              {isLoading ? "Replacing..." : "Replace Library"}
            </Button>
          </div>
        </Dialog>
      </Dialog.Root>
    </>
  );
};
