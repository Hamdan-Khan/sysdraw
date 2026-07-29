import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ExportBackground,
  type ExportFormat,
  type ExportScale,
  useCanvasExport,
} from "@/hooks/useCanvasExport";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { FILE_EXTENSIONS } from "@sysdraw/common";
import { Download, Loader2, Image as LucideImage } from "lucide-react";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <ExportDialogInner onOpenChange={onOpenChange} />}
    </Dialog>
  );
};

const ExportDialogInner = ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
  const { captureImage, exportAsPng, exportAsSvg } = useCanvasExport();
  const { exportOptions, setExportOptions } = useCanvasStore(useShallow(storeSelector));

  const [fileName, setFileName] = useState("diagram");
  const [format, setFormat] = useState<ExportFormat | null>(FILE_EXTENSIONS.PNG);
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
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Export Diagram</DialogTitle>
        <DialogDescription>Export your diagram in your preferred format.</DialogDescription>
      </DialogHeader>

      {/* export preview container */}
      <div className="relative aspect-video w-full rounded-lg border border-border bg-dim/50 flex flex-col items-center justify-center gap-2 text-secondary overflow-hidden">
        {isLoadingPreview ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-5 text-secondary animate-spin" />
            <span className="text-xs font-medium text-secondary">Generating preview…</span>
          </div>
        ) : dataUrl ? (
          <img src={dataUrl} alt="Export preview" className="w-full h-full object-contain p-2" />
        ) : (
          // last fallback
          <div className="flex flex-col items-center gap-2">
            <LucideImage className="size-7 text-secondary/50" />
            <span className="text-xs font-medium text-secondary">Export Preview</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* file name */}
        <Input
          id="export-file-name"
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="diagram"
          required
        />

        {/* background */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-primary shrink-0">Background</span>
          <RadioGroup
            value={exportOptions.background}
            onValueChange={(v) => setExportOptions({ background: v as ExportBackground })}
            className="flex flex-row gap-1 w-auto"
          >
            {backgrounds.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-md border border-border text-xs font-medium text-secondary hover:bg-dim hover:text-primary transition-colors has-data-checked:border-primary/60 has-data-checked:bg-primary/8 has-data-checked:text-primary"
              >
                <RadioGroupItem value={value} className="sr-only" />
                {label}
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* grid */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-primary shrink-0">Grid</span>
          <RadioGroup
            value={String(exportOptions.showGrid)}
            onValueChange={(v) => setExportOptions({ showGrid: v === "true" })}
            className="flex flex-row gap-1 w-auto"
          >
            {gridOptions.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-md border border-border text-xs font-medium text-secondary hover:bg-dim hover:text-primary transition-colors has-data-checked:border-primary/60 has-data-checked:bg-primary/8 has-data-checked:text-primary"
              >
                <RadioGroupItem value={value} className="sr-only" />
                {label}
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* scale */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-primary shrink-0">Scale</span>
          <RadioGroup
            value={String(exportOptions.scale)}
            onValueChange={(v) => setExportOptions({ scale: Number(v) as ExportScale })}
            className="flex flex-row gap-1 w-auto"
          >
            {scales.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-md border border-border text-xs font-medium text-secondary hover:bg-dim hover:text-primary transition-colors has-data-checked:border-primary/60 has-data-checked:bg-primary/8 has-data-checked:text-primary"
              >
                <RadioGroupItem value={String(value)} className="sr-only" />
                {label}
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* padding */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-primary shrink-0">Padding</span>
          <div className="flex items-center gap-1.5">
            <Input
              id="export-padding"
              type="number"
              min={0}
              max={200}
              step={4}
              value={exportOptions.padding}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setExportOptions({ padding: val });
              }}
              className="h-8 w-20 text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs text-secondary">px</span>
          </div>
        </div>

        {/* export action */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs font-bold text-primary shrink-0">Export as</span>
          <div className="flex items-center gap-2">
            <Select value={format} onValueChange={(v) => setFormat(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              disabled={!isFileNameValid}
              onClick={handleExport}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-primary text-xs font-medium hover:bg-dim transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              <Download className="size-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};
