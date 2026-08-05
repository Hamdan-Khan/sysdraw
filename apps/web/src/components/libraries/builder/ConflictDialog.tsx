import { Button, Dialog } from "@cloudflare/kumo";
import { LibraryMetadata } from "@zero-sketch/models";
import { AlertTriangle } from "lucide-react";

interface ConfilctDialogProps {
  conflictLib: LibraryMetadata | null;
  setConflictLib: (conflictLib: LibraryMetadata | null) => void;
  setActiveTab: (tab: "metadata") => void;
}

export const ConfilctDialog = ({
  conflictLib,
  setConflictLib,
  setActiveTab,
}: ConfilctDialogProps) => {
  return (
    <Dialog.Root
      open={!!conflictLib}
      onOpenChange={(open) => !open && setConflictLib(null)}
    >
      <Dialog size="base" className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="size-5 text-kumo-warning" />
          <div>
            <Dialog.Title className="text-base font-bold text-kumo-default">
              Couldn't save library
            </Dialog.Title>
          </div>
        </div>

        <div className="border border-kumo-neutral-450"></div>

        <div className="p-2 text-sm text-kumo-subtle mb-2 leading-relaxed">
          A library named{" "}
          <strong className="text-kumo-default">"{conflictLib?.name}"</strong>{" "}
          already exists in your workspace.
          <br />
          Please update the library name before saving.
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setConflictLib(null);
              setActiveTab("metadata");
            }}
          >
            Change Name
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
};
