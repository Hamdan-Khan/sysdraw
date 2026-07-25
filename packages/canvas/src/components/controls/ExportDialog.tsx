import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCanvasTransfer } from "@/hooks/useCanvasTransfer";
import { FileCode, ImageIcon, Loader2, Image as LucideImage } from "lucide-react";
import { useEffect, useState } from "react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  const { preparePreview, exportAsPng, exportAsSvg, dataUrl } = useCanvasTransfer();
  const [fileName, setFileName] = useState("diagram");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingPreview(true);
      preparePreview().finally(() => {
        setIsLoadingPreview(false);
      });
    }
  }, [open, preparePreview]);

  const isFileNameValid = fileName.trim().length > 0;

  const handleExportPng = () => {
    if (!isFileNameValid) return;
    exportAsPng(fileName.trim());
    onOpenChange(false);
  };

  const handleExportSvg = () => {
    if (!isFileNameValid) return;
    exportAsSvg(fileName.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Diagram</DialogTitle>
          <DialogDescription>Export your diagram in your preferred format.</DialogDescription>
        </DialogHeader>

        {/* export preview container */}
        <div className="relative aspect-video w-full rounded-lg border border-border bg-dim/50 flex flex-col items-center justify-center gap-2 text-secondary overflow-hidden">
          {isLoadingPreview ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 text-secondary animate-spin" />
              <span className="text-xs font-medium text-secondary">Generating preview...</span>
            </div>
          ) : dataUrl ? (
            <img src={dataUrl} alt="Export Preview" className="w-full h-full object-contain p-2" />
          ) : (
            // last fallback
            <div className="flex flex-col items-center gap-2">
              <LucideImage className="size-8 text-secondary/60" />
              <span className="text-xs font-medium text-secondary">Export Preview</span>
            </div>
          )}
        </div>

        {/* file name input */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label
            htmlFor="export-file-name"
            className="px-1 text-xs font-semibold uppercase tracking-wider text-secondary"
          >
            File Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="export-file-name"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="diagram"
            required
          />
        </div>

        {/* export options */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="px-1 text-xs font-semibold uppercase tracking-wider text-secondary">
            Export as:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={!isFileNameValid}
              className="flex items-center justify-center gap-2 h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-primary hover:bg-dim hover:text-primary transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleExportPng}
            >
              <ImageIcon className="size-4 text-secondary" />
              <span>PNG</span>
            </button>
            <button
              type="button"
              disabled={!isFileNameValid}
              className="flex items-center justify-center gap-2 h-9 rounded-md border border-border bg-surface px-3 text-xs font-medium text-primary hover:bg-dim hover:text-primary transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleExportSvg}
            >
              <FileCode className="size-4 text-secondary" />
              <span>SVG</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
