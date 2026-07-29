import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import React from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  variant?: "default" | "destructive";
}

export const ConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon: Icon = AlertTriangle,
  variant = "default",
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon
              className={cn(
                "size-4",
                variant === "destructive" ? "text-red-500" : "text-primary",
              )}
            />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center h-8 px-3 rounded-md border border-border bg-surface text-secondary text-xs font-medium hover:bg-dim hover:text-primary transition-colors cursor-pointer outline-none"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer outline-none shadow-xs",
              variant === "destructive"
                ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-500/20"
                : "border-border bg-surface text-primary hover:bg-dim focus-visible:ring-2 focus-visible:ring-primary/20",
            )}
          >
            <Icon className="size-3.5" />
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
