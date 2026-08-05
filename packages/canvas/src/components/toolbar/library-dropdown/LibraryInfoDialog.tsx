import { Badge, Button, Dialog } from "@cloudflare/kumo";
import { LibraryMetadata } from "@zero-sketch/models";
import { ExternalLink, Package, X } from "lucide-react";
import { useState } from "react";

interface LibraryInfoDialogProps {
  lib: LibraryMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibraryInfoDialog = ({
  lib,
  open,
  onOpenChange,
}: LibraryInfoDialogProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog size="base" className="z-50 p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {lib.icon && !imgError ? (
              <img
                src={lib.icon}
                alt={lib.name}
                onError={() => setImgError(true)}
                className="size-11 rounded-md object-contain border border-border/60 bg-dim/50 p-1 shrink-0"
              />
            ) : (
              <div className="size-11 rounded-md border border-border bg-dim flex items-center justify-center text-secondary shrink-0">
                <Package size={19} />
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <Dialog.Title className="text-lg font-semibold leading-tight">
                {lib.name}
              </Dialog.Title>
              <Badge variant="secondary">v{lib.version}</Badge>
            </div>
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

        <div className="flex flex-col gap-3">
          {lib.description && (
            <Dialog.Description className="text-sm text-kumo-subtle leading-relaxed">
              {lib.description}
            </Dialog.Description>
          )}

          {lib.tags && lib.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lib.tags.map((tag) => (
                <Badge key={tag} variant="info" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {lib.source && (
            <div className="pt-1 border-t border-border">
              <a
                href={lib.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-secondary hover:text-primary transition-colors group"
              >
                <ExternalLink size={11} className="group-hover:text-primary" />
                <span className="truncate max-w-50">{lib.source}</span>
              </a>
            </div>
          )}
        </div>
      </Dialog>
    </Dialog.Root>
  );
};
