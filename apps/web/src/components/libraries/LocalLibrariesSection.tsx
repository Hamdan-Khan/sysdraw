import { Button, Empty } from "@cloudflare/kumo";
import {
  LibraryMetadata,
  useLibraryRegistry,
  useLibraryRegistryStore,
} from "@zero-sketch/models";
import { FolderOpen, FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { LibraryBuilderDialog } from "./builder/LibraryBuilderDialog";
import { LibraryCard } from "./LibraryCard";
import { LibraryNodePreviewModal } from "./LibraryNodePreviewModal";

export const LocalLibrariesSection = () => {
  const registry = useLibraryRegistry();
  const localLibs = useLibraryRegistryStore((state) => state.localLibraries);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] =
    useState<LibraryMetadata | null>(null);

  useEffect(() => {
    registry
      .whenReady()
      .then(() => {
        // also refreshes the store state with latest data
        registry.listLocalLibraries();
      })
      .catch((err) => {
        console.error("Failed to load local libraries:", err);
      });
  }, [registry]);

  return (
    <section className="space-y-6 pt-8 border-t border-neutral-300">
      {/* section header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-black">
              My Local Libraries
            </h2>
          </div>
          <p className="text-base text-kumo-subtle mt-0.5">
            Libraries created or imported locally, stored on your device.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsBuilderOpen(true)}>
          <FolderPlus className="size-4" />
          <span>Create New Library</span>
        </Button>
      </div>

      {/* grid of local libraries */}
      {localLibs.length === 0 ? (
        <Empty
          size="base"
          icon={<FolderOpen className="size-8 text-kumo-subtle" />}
          title="No Local Libraries Created Yet"
          description="Build custom icon libraries by using SVG icons. Download the library and share it across devices."
          className="[&_h2]:text-xl"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {localLibs.map((metadata) => (
            <LibraryCard
              key={metadata.id}
              metadata={metadata}
              variant="local"
              onViewNodes={() => setSelectedPreview(metadata)}
            />
          ))}
        </div>
      )}

      {/* library builder dialog */}
      <LibraryBuilderDialog
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />

      {/* node preview modal */}
      {selectedPreview && (
        <LibraryNodePreviewModal
          isOpen={!!selectedPreview}
          onClose={() => setSelectedPreview(null)}
          metadata={selectedPreview}
          variant="local"
        />
      )}
    </section>
  );
};
