import {
  Badge,
  Button,
  Dialog,
  Empty,
  Loader,
  Tooltip,
} from "@cloudflare/kumo";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LibraryMetadata, LibraryNode } from "@zero-sketch/models";
import { Box, GroupIcon, Layers, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLibraryManifest } from "../../hooks/useLibraryManifest";
import { LibraryIcon } from "../common/LibraryIcon";
import { SearchInput } from "./SearchInput";

interface LibraryNodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: LibraryMetadata | null;
  variant: "community" | "local";
}

const COLUMNS = 6;

export const LibraryNodePreviewModal = ({
  isOpen,
  onClose,
  metadata,
  variant,
}: LibraryNodePreviewModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fetchRemote = variant === "community";

  const { data: manifest, isLoading } = useLibraryManifest(
    isOpen ? metadata?.id : null,
    fetchRemote,
  );

  const nodes: LibraryNode[] = manifest?.nodes ?? [];
  const filteredNodes = nodes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.description &&
        node.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const rowCount = Math.ceil(filteredNodes.length / COLUMNS);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 110,
    gap: 10,
    overscan: 5,
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog size="xl" className="p-0 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b border-kumo-line px-6 py-4 bg-kumo-base">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-kumo-line bg-kumo-tint text-kumo-default shadow-xs overflow-hidden">
              {metadata?.icon ? (
                <img
                  src={metadata.icon}
                  alt={metadata.name}
                  className="size-10 object-contain"
                />
              ) : (
                <Layers className="size-5 text-kumo-default" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Dialog.Title className="text-base sm:text-lg font-bold text-kumo-default tracking-tight">
                  {metadata?.name}
                </Dialog.Title>
                {metadata?.version && (
                  <Badge variant="neutral">v{metadata?.version}</Badge>
                )}
              </div>
              <Dialog.Description className="text-xs text-kumo-subtle font-medium">
                {metadata?.description}
              </Dialog.Description>
            </div>
          </div>

          <Dialog.Close
            render={(props) => (
              <Button
                {...props}
                variant="ghost"
                shape="square"
                size="sm"
                icon={<X className="size-4" />}
                aria-label="Close dialog"
                onClick={onClose}
              />
            )}
          />
        </div>

        {/* toolbar & search */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-kumo-line bg-kumo-tint/50">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search nodes..."
            className="flex-1 max-w-md"
          />

          <div className="text-xs font-medium text-kumo-subtle">
            Showing{" "}
            <span className="font-semibold text-kumo-default">
              {filteredNodes.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-kumo-default">
              {nodes.length}
            </span>{" "}
            items
          </div>
        </div>

        {/* nodes grid scroll container */}
        <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-base font-medium text-kumo-subtle">
                <Loader size="base" />
                <span>Loading nodes...</span>
              </div>
            </div>
          ) : filteredNodes.length === 0 ? (
            <Empty
              size="base"
              icon={<Box className="size-8 text-kumo-subtle" />}
              title="No nodes found"
              description="Try adjusting your search query."
            />
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * COLUMNS;
                const rowNodes = filteredNodes.slice(
                  startIndex,
                  startIndex + COLUMNS,
                );

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5"
                  >
                    {rowNodes.map((node) => (
                      <div
                        key={node.id}
                        className="group relative flex flex-col items-center justify-center p-1 py-4 text-center rounded-xl border border-kumo-line bg-kumo-base hover:bg-kumo-tint/60 transition-colors shadow-2xs"
                      >
                        <div className="mb-1">
                          {node.icon?.kind === "svg" ? (
                            <LibraryIcon
                              className="size-12"
                              svg={node.icon?.value}
                            />
                          ) : node.icon?.value ? (
                            <img
                              src={node.icon.value}
                              alt={node.label}
                              className="size-full object-contain"
                            />
                          ) : (
                            <GroupIcon className="size-5 text-kumo-subtle" />
                          )}
                        </div>
                        <Tooltip content={node.label} delay={0} side="bottom">
                          <span className="text-xs font-semibold text-kumo-default line-clamp-1 w-full px-1">
                            {node.label}
                          </span>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Dialog>
    </Dialog.Root>
  );
};
