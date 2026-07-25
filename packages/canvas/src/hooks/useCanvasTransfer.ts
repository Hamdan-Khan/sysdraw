import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { toPng } from "html-to-image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

const selector = (s: CanvasStoreState) => ({
  nodes: s.nodes,
});

const downloadImage = (dataUrl: string, fileName = "diagram") => {
  const a = document.createElement("a");
  a.href = dataUrl;
  const finalName = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const useCanvasTransfer = () => {
  const { nodes } = useCanvasStore(useShallow(selector));
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const preparePreview = useCallback(async (): Promise<string | null> => {
    const imageWidth = 1024;
    const imageHeight = 768;
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0.1);
    const rf = document.querySelector(".react-flow__viewport") as HTMLElement;

    if (!rf) {
      toast.error("Failed to generate diagram preview");
      return null;
    }

    try {
      const data = await toPng(rf, {
        width: imageWidth,
        height: imageHeight,
        backgroundColor: "#ffffff",
        pixelRatio: 1,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });
      setDataUrl(data);
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate diagram preview");
      return null;
    }
  }, [nodes]);

  const exportAsPng = useCallback(
    async (fileName = "diagram") => {
      let targetDataUrl = dataUrl;
      if (!targetDataUrl) {
        targetDataUrl = await preparePreview();
      }

      if (!targetDataUrl) {
        toast.error("Failed to export diagram");
        return;
      }

      try {
        downloadImage(targetDataUrl, fileName);
        toast.success("Diagram exported successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to export diagram");
      }
    },
    [dataUrl, preparePreview],
  );

  const exportAsSvg = useCallback(async (fileName = "diagram") => {
    toast.info(`Exporting ${fileName} as SVG`, {
      action: {
        label: "Close",
        onClick: () => {
          toast.dismiss();
        },
      },
    });
  }, []);

  const onExport = useCallback(
    (fileName = "diagram") => {
      exportAsPng(fileName);
    },
    [exportAsPng],
  );

  const onOpen = useCallback(() => {
    toast("Open diagram");
  }, []);

  return { onExport, preparePreview, exportAsPng, exportAsSvg, onOpen, dataUrl };
};
