import { Empty, Grid, GridItem, Loader } from "@cloudflare/kumo";
import { LibraryMetadata } from "@zero-sketch/models";
import { useMemo, useState } from "react";
import { useCommunityLibraries } from "../../hooks/useCommunityLibraries";
import { LibraryCard } from "./LibraryCard";
import { LibraryNodePreviewModal } from "./LibraryNodePreviewModal";
import { SearchInput } from "./SearchInput";
import { TagFilter } from "./TagFilter";

export const CommunityLibrariesSection = () => {
  const { data: libraries = [], isLoading, isError } = useCommunityLibraries();

  const [selectedPreview, setSelectedPreview] =
    useState<LibraryMetadata | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allTags = useMemo(() => {
    const tags = new Set<string>(["all"]);
    if (libraries) {
      libraries.forEach((lib) => {
        if (!lib.tags) {
          return;
        }
        lib.tags.forEach((tag) => tags.add(tag));
      });
    }
    return Array.from(tags);
  }, [libraries]);

  const filteredLibraries = libraries.filter((metadata) => {
    if (!metadata) {
      return false;
    }
    const matchesTag =
      selectedTag === "all" || metadata.tags?.includes(selectedTag);
    const matchesQuery =
      metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metadata.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesQuery;
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-kumo-default">Libraries</h2>
        <p className="text-sm sm:text-base text-kumo-subtle mt-0.5">
          Official libraries
        </p>
      </div>

      <div className="flex items-center gap-8">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search libraries..."
          className="w-60 sm:w-80 flex-1"
        />

        <TagFilter
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 bg-kumo-base">
          <div className="flex items-center gap-3 text-base font-medium text-kumo-subtle">
            <Loader size="base" />
            <span>Loading libraries...</span>
          </div>
        </div>
      )}

      {isError && (
        <Empty
          title="Unable to fetch libraries"
          description="Check your internet connection or try reloading the page."
          size="base"
        />
      )}

      {!isLoading && !isError && (
        <>
          {filteredLibraries.length === 0 ? (
            <Empty
              title="No matching libraries"
              description="Try adjusting your search query or tag filter."
              size="base"
            />
          ) : (
            <Grid variant="3up" gap="base">
              {filteredLibraries.map((metadata) => (
                <GridItem key={metadata.id}>
                  <LibraryCard
                    metadata={metadata}
                    variant="community"
                    onViewNodes={() => setSelectedPreview(metadata)}
                  />
                </GridItem>
              ))}
            </Grid>
          )}
        </>
      )}

      <LibraryNodePreviewModal
        isOpen={!!selectedPreview}
        onClose={() => setSelectedPreview(null)}
        metadata={selectedPreview}
        variant="community"
      />
    </section>
  );
};
