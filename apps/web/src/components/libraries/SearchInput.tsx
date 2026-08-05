import { InputGroup } from "@cloudflare/kumo";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search libraries...",
  className = "",
}: SearchInputProps) => {
  return (
    <InputGroup size="base" className={className}>
      <InputGroup.Addon align="start">
        <Search className="size-3.5 text-kumo-subtle" />
      </InputGroup.Addon>
      <InputGroup.Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </InputGroup>
  );
};
