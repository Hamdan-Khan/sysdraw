import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LibraryMetadata, useLibraryRegistry, useLibraryRegistryStore } from "@sysdraw/models";
import { ChevronRight, Image } from "lucide-react";

export const LibraryDropdown = () => {
  const registry = useLibraryRegistry();
  const loadedLibs = useLibraryRegistryStore((state) => state.loadedLibs);

  const libraries: LibraryMetadata[] = registry.listAllLibraries();
  const selectedCount = Object.keys(loadedLibs).length;

  const toggleLibrary = (id: string) => {
    if (loadedLibs[id]) {
      registry.removeLibrary(id);
    } else {
      registry.addLibrary(id);
    }
  };

  return (
    <div className="w-full px-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label="Libraries"
          className="group w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded border transition-all cursor-pointer bg-bg border-border text-primary hover:bg-surface/50 data-popup-open:bg-dim data-popup-open:border-primary data-open:bg-dim data-open:border-primary outline-none"
        >
          <div className="flex items-center gap-2">
            <Image size={16} className="text-secondary" />
            <span>Icon Pack</span>
            {selectedCount > 0 && (
              <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                {selectedCount}
              </span>
            )}
          </div>
          <ChevronRight
            size={14}
            className="text-secondary transition-transform duration-150 group-data-popup-open:rotate-90 group-data-open:rotate-90"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Libraries ({selectedCount}/{libraries.length})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
              {libraries.map((lib) => {
                const isSelected = Boolean(loadedLibs[lib.id]);
                return (
                  <DropdownMenuCheckboxItem
                    key={lib.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleLibrary(lib.id)}
                  >
                    {lib.name}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
