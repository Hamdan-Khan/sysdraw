import { LibraryMetadata, useLibraryRegistry, useLibraryRegistryStore } from "@sysdraw/models";
import { ChevronRight, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
    <div className="px-4">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            aria-label="Libraries"
            className="group w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded border transition-all cursor-pointer bg-bg border-border text-primary hover:bg-surface/50 data-[state=open]:bg-dim data-[state=open]:border-primary outline-none"
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
              className="text-secondary transition-transform duration-150 group-data-[state=open]:rotate-90"
            />
          </button>
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
