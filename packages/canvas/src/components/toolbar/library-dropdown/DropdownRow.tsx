import { Tooltip } from "@/components/common/Tooltip";
import { DropdownMenu } from "@cloudflare/kumo";
import { LibraryManifest, LibraryMetadata } from "@zero-sketch/models";
import { Info, Package, Trash2 } from "lucide-react";
import React, { useState } from "react";

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
    <DropdownMenu.CheckboxItem
      onClick={() => handleSelectLibrary(lib.id)}
      className="group flex items-center justify-between gap-2"
      checked={isSelected}
    >
      <LibraryThumbnail src={lib.icon} alt={lib.name} />
      <span className="flex-1 min-w-0 text-xs font-medium truncate">
        {lib.name}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* info button */}
        <button
          type="button"
          aria-label={`View ${lib.name} info`}
          onClick={(e) => handleOpenInfo(e, lib)}
          className="shrink-0 flex items-center justify-center size-5 rounded text-kumo-subtle hover:text-kumo-default hover:bg-kumo-tint transition-colors cursor-pointer"
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
                ? "text-kumo-subtle/40 cursor-not-allowed"
                : "text-kumo-subtle hover:text-kumo-danger hover:bg-kumo-tint cursor-pointer"
            }`}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </DropdownMenu.CheckboxItem>
  );
};

const LibraryThumbnail = ({ src, alt }: { src?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="size-6 rounded bg-kumo-tint border border-kumo-line flex items-center justify-center text-kumo-subtle shrink-0">
        <Package size={13} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="size-6 rounded object-contain border border-kumo-line shrink-0 p-0.5 bg-kumo-tint"
    />
  );
};
