import { Tabs } from "@cloudflare/kumo";

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

export const TagFilter = ({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterProps) => {
  const tabItems = tags.map((tag) => ({
    value: tag,
    label: <span className="capitalize">{tag}</span>,
  }));

  return (
    <Tabs
      variant="segmented"
      size="base"
      tabs={tabItems}
      value={selectedTag}
      onValueChange={onSelectTag}
    />
  );
};
