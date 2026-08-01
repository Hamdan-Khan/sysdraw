import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LibraryManifestSchema } from "@/lib/import/librarySchemas";
import { sanitizeSvgString } from "@/lib/sanitizeSvg";
import {
  LibraryManifest,
  LibraryMetadata,
  useLibraryRegistry,
} from "@sysdraw/models";
import { AlertTriangle, ExternalLink, Upload } from "lucide-react";
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
      <Dialog open={open && !conflictLib} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Add a Custom Library
            </DialogTitle>
            <DialogDescription>
              Create your own icon library with our Library Builder or upload an
              existing library file.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="w-full border-t border-border my-0.5" />
            <div className="flex flex-col gap-2">
              <p className="text-xs text-secondary leading-relaxed">
                Build custom icon sets and export lightweight library files for
                local use.
              </p>
              <Button
                render={
                  <a
                    href="/libraries"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
                variant="outline"
                color="primary"
                size="lg"
                className="w-full no-underline"
              >
                <ExternalLink className="size-3.5" />
                <span>Build a Library</span>
              </Button>
            </div>

            <div className="relative flex items-center justify-center my-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative px-2.5 bg-surface text-[10px] uppercase font-bold text-secondary tracking-wider">
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
                variant="solid"
                color="primary"
                size="lg"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="size-3.5" />
                <span>
                  {isLoading
                    ? "Processing Library..."
                    : "Upload Library (.json)"}
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* conflict dialog */}
      {conflictLib && (
        <Dialog open={!!conflictLib} onOpenChange={(o) => !o && handleReset()}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-800" />
                Warning
              </DialogTitle>
              <DialogDescription>
                A library named <strong>"{conflictLib.name}"</strong> (v
                {conflictLib.version}) already exists in your workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-md text-xs text-secondary">
              Replacing it will overwrite the library definition stored locally
              on your device.
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                color="secondary"
                size="default"
                onClick={handleReset}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                color="primary"
                size="default"
                disabled={isLoading}
                onClick={handleReplaceConfirm}
              >
                {isLoading ? "Replacing..." : "Replace Library"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
