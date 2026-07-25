import { useCallback } from "react";
import { toast } from "sonner";

export const useCanvasTransfer = () => {
  const onExport = useCallback(() => {
    toast("Export diagram");
  }, []);

  const onOpen = useCallback(() => {
    toast("Open diagram");
  }, []);

  return { onExport, onOpen };
};
