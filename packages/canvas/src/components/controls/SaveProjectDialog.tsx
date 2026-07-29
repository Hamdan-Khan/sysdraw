import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCanvasExport } from "@/hooks/useCanvasExport";
import { Download } from "lucide-react";
import { useState } from "react";

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
    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Save your diagram as a .sysdraw project file.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="save-file-name"
              className="text-xs font-bold text-primary"
            >
              File Name
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="save-file-name"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="diagram"
                autoFocus
                required
              />
              <span className="text-xs text-secondary shrink-0">.sysdraw</span>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSaveDialogOpen(false)}
              className="flex items-center justify-center h-8 px-3 rounded-md border border-border bg-surface text-secondary text-xs font-medium hover:bg-dim hover:text-primary transition-colors cursor-pointer outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFileNameValid}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-primary text-xs font-medium hover:bg-dim transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              <Download className="size-3.5" />
              Save Project
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
