import { Tooltip } from "@/components/common/Tooltip";
import { LibraryManifest, LibraryMetadata } from "@sysdraw/models";
import { Check, Info, Package, Trash2 } from "lucide-react";
import { useState } from "react";

interface DropdownRowProps {
  lib: LibraryMetadata;
  isLocal: boolean;
  selectedLib: LibraryManifest | null;
  handleSelectLibrary: (id: string) => void;
  handleOpenInfo: (e: React.MouseEvent, lib: LibraryMetadata) => void;
  handleDeleteLocal: (e: React.MouseEvent, lib: LibraryMetadata) => void;
}

export const DropdownRow = ({
  lib,
  isLocal,
  selectedLib,
  handleSelectLibrary,
  handleOpenInfo,
  handleDeleteLocal,
}: DropdownRowProps) => {
  const isSelected = selectedLib?.id === lib.id;
  return (
    <div
      key={lib.id}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-dim text-primary"
      }`}
      onClick={() => handleSelectLibrary(lib.id)}
    >
      {/* selection indicator */}
      <span className="size-3.5 shrink-0 flex items-center justify-center">
        {isSelected && (
          <Check size={13} strokeWidth={2.5} className="text-primary" />
        )}
      </span>

      {/* icon */}
      <LibraryThumbnail src={lib.icon} alt={lib.name} />

      {/* label */}
      <span className="flex-1 min-w-0 text-xs font-medium truncate">
        {lib.name}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* info button */}
        <button
          type="button"
          aria-label={`View ${lib.name} info`}
          onClick={(e) => handleOpenInfo(e, lib)}
          className="shrink-0 flex items-center justify-center size-5 rounded text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer"
        >
          <Tooltip text="View Information" direction="up" />
          <Info size={14} />
        </button>

        {/* delete button for local libraries */}
        {isLocal && (
          <button
            type="button"
            aria-label={`Delete ${lib.name}`}
            onClick={(e) => handleDeleteLocal(e, lib)}
            className={`shrink-0 flex items-center justify-center size-5 rounded transition-colors ${
              isSelected
                ? "text-secondary/40 cursor-not-allowed"
                : "text-secondary hover:text-red-500 hover:bg-surface cursor-pointer"
            }`}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

const LibraryThumbnail = ({ src, alt }: { src?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="size-6 rounded bg-dim border border-border flex items-center justify-center text-secondary shrink-0">
        <Package size={13} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="size-6 rounded object-contain border border-border/60 shrink-0 p-0.5 bg-dim"
    />
  );
};
