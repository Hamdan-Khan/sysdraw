import { InputGroup, Label, Select, Textarea } from "@cloudflare/kumo";
import { BuilderFormState } from "../../../lib/libraryUtils";

interface LibraryMetadataTabProps {
  form: BuilderFormState;
  setForm: (form: BuilderFormState) => void;
}

const DEFAULT_TAGS = [
  { value: "cloud", label: "Cloud" },
  { value: "custom", label: "Custom" },
  { value: "database", label: "Database" },
  { value: "messaging", label: "Messaging" },
  { value: "networking", label: "Networking" },
  { value: "security", label: "Security" },
  { value: "misc", label: "Misc" },
];

export const LibraryMetadataTab = ({
  form,
  setForm,
}: LibraryMetadataTabProps) => {
  const selectedTags = form.tags
    ? form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const handleTagsChange = (val: string | string[]) => {
    const tagsArray = Array.isArray(val) ? val : [val];
    setForm({ ...form, tags: tagsArray.join(", ") });
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 py-4">
      <div>
        <Label className="mb-1.5">Library Name</Label>
        <InputGroup size="base">
          <InputGroup.Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Microservices & Message Queues"
          />
        </InputGroup>
      </div>

      <div>
        <Label showOptional className="mb-1.5">
          Description
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Briefly describe the components in this icon set..."
          className="w-full"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label showOptional className="mb-1.5">
            Version
          </Label>
          <InputGroup size="base">
            <InputGroup.Input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="1.0.0"
            />
          </InputGroup>
        </div>

        <div>
          <Label
            showOptional
            className="mb-1.5"
            tooltip="Select tags to categorize this library"
          >
            Tags
          </Label>
          <Select
            multiple
            placeholder="Select tags..."
            value={selectedTags}
            renderValue={(value) => {
              if (value.length > 3) {
                return (
                  <span className="line-clamp-1">
                    {value.slice(0, 2).join(", ") +
                      ` and ${value.length - 2} more`}
                  </span>
                );
              }
              return <span>{value.join(", ")}</span>;
            }}
            onValueChange={handleTagsChange}
            className="w-full"
          >
            {DEFAULT_TAGS.map((tag) => (
              <Select.Option key={tag.value} value={tag.value}>
                {tag.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};
