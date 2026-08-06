import { useCanvasExport } from "@/hooks/useCanvasExport";
import { Button, Dialog, Input, Label } from "@cloudflare/kumo";
import { Download, X } from "lucide-react";
import React, { useState } from "react";

interface SaveProjectDialogProps {
  isSaveDialogOpen: boolean;
  setIsSaveDialogOpen: (open: boolean) => void;
}

// todo: add localstorage sync for project name
export const SaveProjectDialog = ({
  isSaveDialogOpen,
  setIsSaveDialogOpen,
}: SaveProjectDialogProps) => {
  const { exportAsProject } = useCanvasExport();
  const [fileName, setFileName] = useState("diagram");

  const isFileNameValid = fileName.trim().length > 0;

  const handleSave = (e?: React.SubmitEvent) => {
    e?.preventDefault();
    if (!isFileNameValid) {
      return;
    }
    exportAsProject(fileName.trim());
    setIsSaveDialogOpen(false);
  };

  return (
    <Dialog.Root open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
      <Dialog size="base" className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Dialog.Title className="text-lg font-semibold">
              Save Project
            </Dialog.Title>
            <Dialog.Description className="text-sm text-kumo-subtle">
              Save your diagram as a{" "}
              <span className="font-semibold text-kumo-badge-neutral-subtle">
                .zerosketch
              </span>{" "}
              project file.
            </Dialog.Description>
          </div>
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

        <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="save-file-name" className="text-sm ml-1">
              File Name
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="save-file-name"
                aria-label="File Name"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="diagram"
                autoFocus
                required
                className="w-full"
              />
              <span className="text-xs text-kumo-subtle shrink-0 font-mono">
                .zerosketch
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close
              render={(props) => (
                <Button
                  variant="secondary"
                  size="sm"
                  {...props}
                  type="button"
                  onClick={() => setIsSaveDialogOpen(false)}
                >
                  Cancel
                </Button>
              )}
            />
            <Button
              type="submit"
              disabled={!isFileNameValid}
              variant="primary"
              size="sm"
              icon={<Download className="size-3.5" />}
            >
              Save Project
            </Button>
          </div>
        </form>
      </Dialog>
    </Dialog.Root>
  );
};
