import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LibraryMetadata } from "@zero-sketch/models";
import { ExternalLink, Package } from "lucide-react";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm z-60">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            {lib.icon && !imgError ? (
              <img
                src={lib.icon}
                alt={lib.name}
                onError={() => setImgError(true)}
                className="size-10 rounded-md object-contain border border-border/60 bg-dim p-1 shrink-0"
              />
            ) : (
              <div className="size-10 rounded-md border border-border bg-dim flex items-center justify-center text-secondary shrink-0">
                <Package size={18} />
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <DialogTitle className="leading-tight">{lib.name}</DialogTitle>
              {lib.version && (
                <span className="text-[10px] text-secondary">
                  v{lib.version}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {lib.description && (
            <p className="text-xs text-secondary leading-relaxed">
              {lib.description}
            </p>
          )}

          {lib.tags && lib.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lib.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20"
                >
                  {tag}
                </span>
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
      </DialogContent>
    </Dialog>
  );
};
