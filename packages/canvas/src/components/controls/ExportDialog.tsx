import {
  type ExportBackground,
  type ExportFormat,
  type ExportScale,
  useCanvasExport,
} from "@/hooks/useCanvasExport";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { Button, Dialog, Input, Label, Radio, Select } from "@cloudflare/kumo";
import { FILE_EXTENSIONS } from "@zero-sketch/common";
import { Download, Loader2, Image as LucideImage, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const storeSelector = (s: CanvasStoreState) => ({
  exportOptions: s.exportOptions,
  setExportOptions: s.setExportOptions,
});

export const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <ExportDialogInner onOpenChange={onOpenChange} />
    </Dialog.Root>
  );
};

const ExportDialogInner = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  const { captureImage, exportAsPng, exportAsSvg } = useCanvasExport();
  const { exportOptions, setExportOptions } = useCanvasStore(
    useShallow(storeSelector),
  );

  const [fileName, setFileName] = useState("diagram");
  const [format, setFormat] = useState<ExportFormat | null>(
    FILE_EXTENSIONS.PNG,
  );
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // refreshes preview on mount and whenever options change
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPreview(true);
    captureImage(format ?? FILE_EXTENSIONS.PNG).then((url) => {
      if (isMounted) {
        setDataUrl(url);
        setIsLoadingPreview(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [
    exportOptions.background,
    exportOptions.scale,
    exportOptions.padding,
    exportOptions.showGrid,
    format,
    captureImage,
  ]);

  const isFileNameValid = fileName.trim().length > 0;

  const handleExport = () => {
    if (!isFileNameValid) {
      return;
    }
    const name = fileName.trim();
    if (format === FILE_EXTENSIONS.PNG) {
      exportAsPng(name);
    } else if (format === FILE_EXTENSIONS.SVG) {
      exportAsSvg(name);
    }
    onOpenChange(false);
  };

  const backgrounds: { value: ExportBackground; label: string }[] = [
    { value: "white", label: "White" },
    { value: "transparent", label: "None" },
  ];

  const gridOptions = [
    { value: "true", label: "Show" },
    { value: "false", label: "Hide" },
  ];

  const scales: { value: ExportScale; label: string }[] = [
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 3, label: "3x" },
  ];

  const formats: { value: ExportFormat; label: string }[] = [
    { value: FILE_EXTENSIONS.PNG, label: "png" },
    { value: FILE_EXTENSIONS.SVG, label: "svg" },
  ];

  return (
    <Dialog size="base" className="p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Dialog.Title className="text-lg font-semibold">
            Export Diagram
          </Dialog.Title>
          <Dialog.Description className="text-sm text-kumo-subtle">
            Export your diagram in your preferred format.
          </Dialog.Description>
        </div>
        <Dialog.Close
          aria-label="Close"
          render={(props) => (
            <Button
              {...props}
              variant="secondary"
              shape="square"
              size="sm"
              icon={<X className="size-4" />}
              aria-label="Close"
            />
          )}
        />
      </div>

      {/* export preview container */}
      <div className="relative aspect-video w-full rounded-lg border border-border bg-dim/50 flex flex-col items-center justify-center gap-2 text-secondary overflow-hidden mb-4">
        {isLoadingPreview ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-5 text-secondary animate-spin" />
            <span className="text-xs font-medium text-secondary">
              Generating preview…
            </span>
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="Export preview"
            className="w-full h-full object-contain p-2"
          />
        ) : (
          // last fallback
          <div className="flex flex-col items-center gap-2">
            <LucideImage className="size-7 text-secondary/50" />
            <span className="text-xs font-medium text-secondary">
              Export Preview
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* file name */}
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="export-file-name" className="text-sm font-bold">
            File Name
          </Label>
          <Input
            id="export-file-name"
            type="text"
            size="sm"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="diagram"
            required
          />
        </div>

        {/* background */}
        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm font-bold">Background</Label>
          <Radio.Group
            value={exportOptions.background}
            onValueChange={(v) =>
              setExportOptions({ background: v as ExportBackground })
            }
            orientation="horizontal"
            className="[&_span]:text-xs"
          >
            {backgrounds.map(({ value, label }) => (
              <Radio.Item key={value} value={value} label={label} />
            ))}
          </Radio.Group>
        </div>

        {/* grid */}
        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm font-bold">Grid</Label>
          <Radio.Group
            value={String(exportOptions.showGrid)}
            onValueChange={(v) => setExportOptions({ showGrid: v === "true" })}
            orientation="horizontal"
            className="[&_span]:text-xs"
          >
            {gridOptions.map(({ value, label }) => (
              <Radio.Item key={value} value={value} label={label} />
            ))}
          </Radio.Group>
        </div>

        {/* scale */}
        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm font-bold">Scale</Label>
          <Radio.Group
            value={String(exportOptions.scale)}
            onValueChange={(v) =>
              setExportOptions({ scale: Number(v) as ExportScale })
            }
            orientation="horizontal"
            className="[&_span]:text-xs"
          >
            {scales.map(({ value, label }) => (
              <Radio.Item
                key={String(value)}
                value={String(value)}
                label={label}
              />
            ))}
          </Radio.Group>
        </div>

        {/* padding */}
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="export-padding" className="text-sm font-bold">
            Padding
          </Label>
          <div className="flex items-center gap-1.5">
            <Input
              id="export-padding"
              type="number"
              min={0}
              max={200}
              step={4}
              value={exportOptions.padding}
              size="sm"
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setExportOptions({ padding: val });
              }}
              className="text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs text-secondary">px</span>
          </div>
        </div>

        {/* export action */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Label className="text-sm font-bold">Export as</Label>
          <div className="flex items-center gap-2">
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              renderValue={(v) => formats.find((f) => f.value === v)?.label}
              size="sm"
            >
              {formats.map((f) => (
                <Select.Option key={f.value} value={f.value}>
                  {f.label}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="button"
              disabled={!isFileNameValid || isLoadingPreview}
              onClick={handleExport}
              variant="primary"
              size="sm"
              icon={<Download className="size-3.5" />}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
