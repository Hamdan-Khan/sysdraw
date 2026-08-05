import { Badge, Button, Dialog, Tabs } from "@cloudflare/kumo";
import { LibraryMetadata, useLibraryRegistry } from "@zero-sketch/models";
import { Download, HelpCircle, Save, X } from "lucide-react";
import { nanoid } from "nanoid";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import {
  assembleLibraryManifest,
  BuilderFormState,
  downloadJson,
  sanitizeSvgString,
} from "../../../lib/libraryUtils";
import { ConfilctDialog } from "./ConflictDialog";
import { LibraryIconsTab } from "./LibraryIconsTab";
import { LibraryMetadataTab } from "./LibraryMetadataTab";

interface LibraryBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type BuilderTabs = "metadata" | "nodes";

export const LibraryBuilderDialog = ({
  isOpen,
  onClose,
}: LibraryBuilderDialogProps) => {
  const registry = useLibraryRegistry();
  const [form, setForm] = useState<BuilderFormState>({
    name: "",
    description: "",
    version: "1.0.0",
    tags: "",
    nodes: [],
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<BuilderTabs>("nodes");
  const [conflictLib, setConflictLib] = useState<LibraryMetadata | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processSvgFiles = async (files: FileList | File[]) => {
    const svgFiles = Array.from(files).filter(
      (file) => file.name.endsWith(".svg") || file.type.includes("svg"),
    );

    if (svgFiles.length === 0) {
      toast.error("Please select valid SVG files (.svg).");
      return;
    }

    const nodePromises = svgFiles.map(
      async (file): Promise<BuilderFormState["nodes"][number] | null> => {
        try {
          const text = await file.text();
          const sanitized = sanitizeSvgString(text);

          // construct node's name by formatting file name
          const rawLabel = file.name
            .replace(".svg", "")
            .replaceAll("-", " ")
            .replaceAll("_", " ");
          const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

          return {
            id: nanoid(),
            label,
            // todo: add description input later when AI is added
            // description,
            type: "node",
            svgContent: sanitized,
          };
        } catch (err) {
          console.error(`Failed to process ${file.name}`, err);
          return null;
        }
      },
    );

    const parsedNodes = await Promise.all(nodePromises);
    const newNodes = parsedNodes.filter((node) => node !== null);

    setForm((prev) => ({
      ...prev,
      nodes: [...prev.nodes, ...newNodes],
    }));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSvgFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSvgFiles(e.target.files);
    }
  };

  const handleRemoveNode = (id: string) => {
    setForm((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
    }));
  };

  const handleUpdateNode = (id: string, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === id ? { ...n, [field]: value } : n,
      ),
    }));
  };

  const handleDownload = () => {
    if (!form.name.trim()) {
      toast.error("Please enter a library name.");
      return;
    }
    if (form.nodes.length === 0) {
      toast.error("Please add at least one SVG node before downloading.");
      return;
    }

    try {
      const manifest = assembleLibraryManifest(form);
      const fileName = form.name.toLowerCase().trim().replace(/\s+/g, "-");
      downloadJson(manifest, `${fileName}.json`);
      toast.success("Downloaded library JSON file!");
    } catch (err) {
      console.error("Failed to download library JSON", err);
      toast.error("Failed to download library JSON file.");
    }
  };

  const handleSaveLocal = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a library name.");
      return;
    }
    if (form.nodes.length === 0) {
      toast.error("Please add at least one SVG node before saving.");
      return;
    }

    try {
      const manifest = assembleLibraryManifest(form);
      const result = await registry.addLocalLibrary(manifest);

      if (result.success) {
        toast.success(`Library "${manifest.name}" saved to local workspace!`);
        setConflictLib(null);
        setForm({
          name: "",
          description: "",
          version: "1.0.0",
          tags: "",
          nodes: [],
        });
        onClose();
      } else if (result.conflict) {
        setConflictLib(result.conflict);
      }
    } catch (err) {
      console.error("Failed to save library to local workspace", err);
      toast.error("An unexpected error occurred while saving the library.");
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Dialog size="xl" className="p-0 overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between border-b border-kumo-line px-6 py-4 bg-kumo-base">
            <div className="flex items-center gap-3">
              <div>
                <Dialog.Title className="text-lg sm:text-xl font-bold text-kumo-default tracking-tight">
                  Library Builder
                </Dialog.Title>
                <Dialog.Description className="text-sm text-kumo-subtle font-medium">
                  Bulk upload SVGs, label nodes, and export a ready-to-use
                  ZeroSketch library.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close
              render={(props) => (
                <Button
                  {...props}
                  variant="ghost"
                  shape="square"
                  size="sm"
                  icon={<X className="size-4" />}
                  aria-label="Close dialog"
                  onClick={onClose}
                />
              )}
            />
          </div>

          {/* navigation tabs */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-kumo-line bg-kumo-tint/50">
            <Tabs
              variant="underline"
              size="base"
              selectedValue={activeTab}
              onValueChange={(val) => setActiveTab(val as BuilderTabs)}
              tabs={[
                {
                  value: "nodes",
                  label: (
                    <>
                      Icons
                      <Badge variant="neutral" className="ml-2 rounded-full">
                        {form.nodes.length}
                      </Badge>
                    </>
                  ),
                },
                { value: "metadata", label: "Library Metadata" },
              ]}
            />
          </div>

          {/* body */}
          <div className="flex-1 max-h-[60vh] overflow-y-auto p-6">
            {activeTab === "metadata" ? (
              <LibraryMetadataTab form={form} setForm={setForm} />
            ) : (
              <LibraryIconsTab
                nodes={form.nodes}
                isDragOver={isDragOver}
                fileInputRef={fileInputRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileInput={handleFileInput}
                onClearNodes={() => setForm((prev) => ({ ...prev, nodes: [] }))}
                onRemoveNode={handleRemoveNode}
                onUpdateNode={handleUpdateNode}
              />
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between border-t border-kumo-line px-6 py-4 bg-kumo-base text-xs font-medium text-kumo-subtle gap-2">
            <div className="text-xs text-kumo-subtle flex items-center gap-1.5 font-medium">
              <HelpCircle className="size-6 text-kumo-subtle" />
              Saved libraries can be selected anytime from the ZeroSketch canvas
              toolbar.
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                icon={<Download className="size-4" />}
                onClick={handleDownload}
              >
                Download
              </Button>

              <Button
                size="sm"
                variant="primary"
                icon={<Save className="size-4" />}
                onClick={handleSaveLocal}
              >
                Save to My Local Libraries
              </Button>
            </div>
          </div>
        </Dialog>
      </Dialog.Root>

      {/* name conflict dialog */}
      <ConfilctDialog
        conflictLib={conflictLib}
        setConflictLib={setConflictLib}
        setActiveTab={setActiveTab}
      />
    </>
  );
};
