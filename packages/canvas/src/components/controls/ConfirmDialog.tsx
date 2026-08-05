import { Button, Dialog } from "@cloudflare/kumo";
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
    <Dialog.Root
      role={variant === "destructive" ? "alertdialog" : "dialog"}
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog size="base" className="z-50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <Icon
            className={
              variant === "destructive"
                ? "size-4.5 text-kumo-danger shrink-0"
                : "size-4.5 text-kumo-default shrink-0"
            }
          />
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
        </div>
        <Dialog.Description className="text-sm text-kumo-subtle">
          {description}
        </Dialog.Description>
        <div className="mt-6 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button
                variant="secondary"
                size="sm"
                {...props}
                onClick={() => onOpenChange(false)}
              >
                {cancelText}
              </Button>
            )}
          />
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
};
