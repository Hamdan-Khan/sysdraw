import {
  Button,
  Empty,
  Grid,
  GridItem,
  InputGroup,
  Label,
  LayerCard,
  Select,
} from "@cloudflare/kumo";
import { Trash2, UploadCloud } from "lucide-react";
import { ChangeEvent, DragEvent, RefObject } from "react";
import { BuilderFormState } from "../../../lib/libraryUtils";

interface LibraryIconsTabProps {
  nodes: BuilderFormState["nodes"];
  isDragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearNodes: () => void;
  onRemoveNode: (id: string) => void;
  onUpdateNode: (id: string, field: string, value: string) => void;
}

export const LibraryIconsTab = ({
  nodes,
  isDragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  onClearNodes,
  onRemoveNode,
  onUpdateNode,
}: LibraryIconsTabProps) => {
  return (
    <div className="space-y-6">
      {/* drag and drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-kumo-neutral-450 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-kumo-brand bg-kumo-tint scale-[1.01]"
            : "border-kumo-line bg-kumo-base hover:border-kumo-line-hover hover:bg-kumo-tint/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          multiple
          onChange={onFileInput}
          className="hidden"
        />

        <div className="flex size-12 items-center justify-center rounded-full border border-kumo-line bg-kumo-tint text-kumo-default mb-3 shadow-xs transition-transform group-hover:scale-105">
          <UploadCloud className="size-6 text-kumo-default" />
        </div>

        <h3 className="text-lg font-bold text-kumo-default">
          Drop SVG Icons Here
        </h3>
        <p className="text-xs text-kumo-subtle max-w-sm mt-1 font-medium">
          You can drop multiple SVG files at once, or click to browse files from
          your computer.
        </p>
      </div>

      {/* uploaded nodes grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-kumo-subtle">
            Uploaded Icons ({nodes.length})
          </h4>
          {nodes.length > 0 && (
            <Button size="sm" variant="destructive" onClick={onClearNodes}>
              Clear all nodes
            </Button>
          )}
        </div>

        {nodes.length === 0 ? (
          <Empty
            size="base"
            title="No SVG icons added yet"
            description="Drop SVG files above to create your custom icon library!"
            className="[&_h2]:text-lg [&_p]:text-sm"
          />
        ) : (
          <Grid variant="4up" gap="sm">
            {nodes.map((node) => (
              <GridItem key={node.id}>
                <LayerCard className="relative flex flex-col justify-between p-3.5 space-y-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    shape="square"
                    icon={<Trash2 className="size-3.5 text-kumo-danger" />}
                    onClick={() => onRemoveNode(node.id)}
                    title="Remove node"
                    className="absolute right-2 top-2"
                    aria-label="Remove node"
                  />

                  {/* preview box */}
                  {/* todo: create an icon comp */}
                  <div className="flex size-14 items-center justify-center self-center rounded-lg bg-kumo-tint p-2 text-kumo-default border border-kumo-line mt-2">
                    <div
                      className="size-full flex items-center justify-center [&>svg]:size-full [&>svg]:object-contain"
                      dangerouslySetInnerHTML={{
                        __html: node.svgContent,
                      }}
                    />
                  </div>

                  {/* inline edit form */}
                  <div className="space-y-2">
                    <div>
                      <Label className="mb-2 text-sm">Label</Label>
                      <InputGroup size="sm">
                        <InputGroup.Input
                          value={node.label}
                          onChange={(e) =>
                            onUpdateNode(node.id, "label", e.target.value)
                          }
                          aria-label="Label"
                        />
                      </InputGroup>
                    </div>

                    <div>
                      <Label className="mb-2 text-sm">Type</Label>
                      <Select
                        size="sm"
                        value={node.type}
                        onValueChange={(val) =>
                          onUpdateNode(node.id, "type", val as string)
                        }
                        className="w-full"
                      >
                        <Select.Option value="node">node</Select.Option>
                        <Select.Option value="group">group</Select.Option>
                      </Select>
                    </div>
                  </div>
                </LayerCard>
              </GridItem>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
};
