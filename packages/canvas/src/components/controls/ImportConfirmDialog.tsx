import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderOpen } from "lucide-react";

interface ImportConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ImportConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: ImportConfirmDialogProps) => {
  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="size-4 text-primary" />
            Import Project
          </DialogTitle>
          <DialogDescription>
            Importing a project file will replace your current canvas. Any unsaved progress will be
            lost. Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center h-8 px-3 rounded-md border border-border bg-surface text-secondary text-xs font-medium hover:bg-dim hover:text-primary transition-colors cursor-pointer outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-primary text-xs font-medium hover:bg-dim transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
          >
            <FolderOpen className="size-3.5" />
            Confirm & Open
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
