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
  placeholder,
}: SearchInputProps) => {
  return (
    <div className="relative flex items-center animate-in fade-in-0 duration-150">
      <Search className="absolute left-1.5 size-3 text-secondary/60 pointer-events-none" />
      <input
        autoFocus
        type="text"
        placeholder={placeholder || "Search..."}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSearchValue("");
            onSearchOpenChange(false);
          }
        }}
        className="w-24 pl-5 pr-4 py-0.5 text-[11px] bg-bg border border-border rounded text-text placeholder:text-secondary/50 focus:outline-none focus:border-primary/60 transition-all"
      />
      <button
        onClick={() => {
          setSearchValue("");
          onSearchOpenChange(false);
        }}
        className="absolute right-1 text-secondary/60 hover:text-text cursor-pointer p-0.5"
        aria-label="Close search"
      >
        <X className="size-3" />
      </button>
    </div>
  );
};
