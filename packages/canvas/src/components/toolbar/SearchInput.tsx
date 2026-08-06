import { InputGroup } from "@cloudflare/kumo";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  onSearchOpenChange: (value: boolean) => void;
  placeholder?: string;
}

export const SearchInput = ({
  searchValue,
  setSearchValue,
  onSearchOpenChange,
  placeholder = "Search...",
}: SearchInputProps) => {
  return (
    <div className="animate-in fade-in-0 duration-150">
      <InputGroup size="sm" className="w-28">
        <InputGroup.Addon align="start" className="px-1.5">
          <Search className="size-3 text-kumo-subtle pointer-events-none" />
        </InputGroup.Addon>
        <InputGroup.Input
          autoFocus
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchValue("");
              onSearchOpenChange(false);
            }
          }}
          className="text-[11px] py-0.5 px-1"
        />
        <InputGroup.Addon align="end" className="px-1">
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              onSearchOpenChange(false);
            }}
            className="text-kumo-subtle hover:text-kumo-default cursor-pointer p-0.5 rounded transition-colors"
            aria-label="Close search"
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
};
