import { Badge, Button, LayerCard, LinkButton } from "@cloudflare/kumo";
import { LibraryMetadata, useLibraryRegistry } from "@zero-sketch/models";
import { Check, Eye, Layers, Plus, Trash2, X } from "lucide-react";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

interface LibraryCardProps {
  metadata: LibraryMetadata;
  variant: "community" | "local";
  onViewNodes?: (metadata: LibraryMetadata) => void;
}

export const LibraryCard = ({
  metadata,
  variant,
  onViewNodes,
}: LibraryCardProps) => {
  const registry = useLibraryRegistry();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (confirmingDelete) {
      registry
        .deleteLocalLibrary(metadata.id)
        .then(() => {
          toast.success(`Library "${metadata.name}" deleted.`);
        })
        .catch((err) => {
          console.error("Failed to delete library:", err);
          toast.error(`Failed to delete library "${metadata.name}".`);
        });
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  };

  const cancelDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setConfirmingDelete(false);
  };

  return (
    <LayerCard className="relative flex flex-col justify-between rounded-xl border border-kumo-line bg-kumo-base p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md h-full">
      <div className="flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-kumo-tint border border-kumo-line shadow-xs overflow-hidden">
              {metadata.icon ? (
                <img
                  src={metadata.icon}
                  alt={metadata.name}
                  className="size-8 object-contain"
                />
              ) : (
                <Layers className="size-5 text-kumo-default" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-kumo-default tracking-tight text-base">
                  {metadata.name}
                </h3>
                <Badge variant="neutral">v{metadata.version}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* description */}
        <p className="text-sm text-kumo-subtle leading-relaxed mb-4">
          {metadata.description || "Custom component & diagramming library."}
        </p>

        {/* tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 mb-4">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="info" className="gap-1 font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* footer info & actions */}
      <div className="pt-3 border-t border-kumo-line flex items-center justify-between gap-2">
        <span className="text-xs text-kumo-subtle font-medium">
          {variant === "community" ? "Official" : "Local"}
        </span>

        <div className="flex items-center gap-2">
          {onViewNodes && (
            <Button
              size="sm"
              variant="secondary"
              icon={<Eye className="size-4" />}
              onClick={() => onViewNodes(metadata)}
              title="View icon nodes grid"
            >
              Preview
            </Button>
          )}

          <LinkButton
            size="sm"
            variant="primary"
            icon={<Plus className="size-4" />}
            title="Use in diagram"
            href={`/?library=${metadata.id}`}
          >
            Use
          </LinkButton>

          {/* delete button (local libraries only) */}
          {variant === "local" &&
            (confirmingDelete ? (
              <div className="flex items-center gap-1 bg-kumo-danger/10 p-1 rounded-lg border border-kumo-danger/20">
                <Button
                  size="sm"
                  variant="destructive"
                  shape="square"
                  icon={<Check className="size-4" />}
                  onClick={handleDelete}
                  aria-label="Confirm Delete"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  shape="square"
                  icon={<X className="size-4" />}
                  onClick={cancelDelete}
                  aria-label="Cancel"
                />
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary-destructive"
                shape="square"
                icon={<Trash2 className="size-4" />}
                onClick={handleDelete}
                aria-label="Delete Library"
              />
            ))}
        </div>
      </div>
    </LayerCard>
  );
};
