import { ExportReadyPayload } from "@/components/export/ExportRenderer";
import { DEFAULT_EXPORT_OPTIONS, useCanvasExport } from "@/hooks/useCanvasExport";
import { renderToNativeSvg } from "@/lib/svgExport";
import { downloadImage } from "@/lib/utils";
import { CanvasStoreProvider } from "@/store/CanvasStoreProvider";
import { renderHook } from "@testing-library/react";
import { toPng } from "html-to-image";
import React from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeStore } from "./utils/utils";

vi.mock("html-to-image", () => ({
  toPng: vi.fn(),
}));

vi.mock("@/lib/svgExport", () => ({
  renderToNativeSvg: vi.fn(),
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    downloadImage: vi.fn(),
  };
});

vi.mock("@/components/export/ExportRenderer", () => ({
  ExportRenderer: ({ onReady: _onReady }: { onReady: (payload: ExportReadyPayload) => void }) => (
    <div data-testid="export-renderer-mock" />
  ),
}));

const createWrapper = (store: ReturnType<typeof makeStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <CanvasStoreProvider store={store}>{children}</CanvasStoreProvider>
  );
};

describe("useCanvasExport", () => {
  const mockFlowEl = document.createElement("div");

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("exports DEFAULT_EXPORT_OPTIONS with expected initial configuration", () => {
    expect(DEFAULT_EXPORT_OPTIONS).toEqual({
      background: "white",
      scale: 1,
      padding: 40,
      showGrid: true,
    });
  });

  it("returns null for ExportCanvas when isExporting is false", () => {
    const store = makeStore();
    const { result } = renderHook(() => useCanvasExport(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.ExportCanvas).toBeNull();
  });

  it("returns ExportRenderer element when isExporting is true", () => {
    const store = makeStore();
    store.setState({ isExporting: true });

    const { result } = renderHook(() => useCanvasExport(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.ExportCanvas).not.toBeNull();
  });

  describe("captureImage", () => {
    it("captures PNG image successfully with default format and white background", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const mockDataUrl = "data:image/png;base64,mockpngdata";
      vi.mocked(toPng).mockResolvedValue(mockDataUrl);

      const capturePromise = result.current.captureImage();

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 500,
        height: 400,
      });

      const dataUrl = await capturePromise;

      expect(dataUrl).toBe(mockDataUrl);
      expect(toPng).toHaveBeenCalledWith(mockFlowEl, {
        width: 500,
        height: 400,
        backgroundColor: "#ffffff",
        pixelRatio: 1,
        style: {
          width: "500px",
          height: "400px",
        },
      });
      expect(store.getState().isExporting).toBe(false);
    });

    it("captures PNG image with transparent background and custom scale option", async () => {
      const store = makeStore();
      store.getState().setExportOptions({ background: "transparent", scale: 3 });

      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const mockDataUrl = "data:image/png;base64,transparentpng";
      vi.mocked(toPng).mockResolvedValue(mockDataUrl);

      const capturePromise = result.current.captureImage("png");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 300,
        height: 200,
      });

      const dataUrl = await capturePromise;

      expect(dataUrl).toBe(mockDataUrl);
      expect(toPng).toHaveBeenCalledWith(mockFlowEl, {
        width: 300,
        height: 200,
        backgroundColor: undefined,
        pixelRatio: 3,
        style: {
          width: "300px",
          height: "200px",
        },
      });
      expect(store.getState().isExporting).toBe(false);
    });

    it("captures SVG image successfully", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const mockSvgData = "data:image/svg+xml;utf8,<svg></svg>";
      vi.mocked(renderToNativeSvg).mockReturnValue(mockSvgData);

      const capturePromise = result.current.captureImage("svg");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 600,
        height: 450,
      });

      const dataUrl = await capturePromise;

      expect(dataUrl).toBe(mockSvgData);
      expect(renderToNativeSvg).toHaveBeenCalledWith(mockFlowEl, 600, 450, "#ffffff");
      expect(store.getState().isExporting).toBe(false);
    });

    it("handles error during toPng execution gracefully", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(toPng).mockRejectedValue(new Error("toPng failure"));

      const capturePromise = result.current.captureImage("png");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 500,
        height: 400,
      });

      const dataUrl = await capturePromise;

      expect(dataUrl).toBeNull();
      expect(toast.error).toHaveBeenCalledWith("Failed to capture diagram");
      expect(store.getState().isExporting).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("exportAsPng", () => {
    it("downloads PNG file and shows success toast when capture succeeds", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const mockDataUrl = "data:image/png;base64,pngdata";
      vi.mocked(toPng).mockResolvedValue(mockDataUrl);

      const exportPromise = result.current.exportAsPng("architecture.png");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 800,
        height: 600,
      });

      await exportPromise;

      expect(downloadImage).toHaveBeenCalledWith(mockDataUrl, "architecture.png", "png");
      expect(toast.success).toHaveBeenCalledWith("Diagram exported as png successfully");
      expect(store.getState().isExporting).toBe(false);
    });

    it("shows error toast when captureImage returns null", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(toPng).mockRejectedValue(new Error("Render error"));

      const exportPromise = result.current.exportAsPng("diagram.png");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 500,
        height: 400,
      });

      await exportPromise;

      expect(toast.error).toHaveBeenCalledWith("Failed to capture diagram");
      expect(toast.error).toHaveBeenCalledWith("Failed to export diagram");
      expect(downloadImage).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("shows error toast when downloadImage method throws an exception", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockDataUrl = "data:image/png;base64,pngdata";
      vi.mocked(toPng).mockResolvedValue(mockDataUrl);
      vi.mocked(downloadImage).mockImplementation(() => {
        throw new Error("Download error");
      });

      const exportPromise = result.current.exportAsPng("diagram.png");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 500,
        height: 400,
      });

      await exportPromise;

      expect(toast.error).toHaveBeenCalledWith("Failed to export diagram");
      consoleSpy.mockRestore();
    });
  });

  describe("exportAsSvg", () => {
    it("downloads SVG file and shows success toast when capture succeeds", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const mockSvgData = "data:image/svg+xml;utf8,<svg></svg>";
      vi.mocked(renderToNativeSvg).mockReturnValue(mockSvgData);

      const exportPromise = result.current.exportAsSvg("architecture.svg");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 800,
        height: 600,
      });

      await exportPromise;

      expect(downloadImage).toHaveBeenCalledWith(mockSvgData, "architecture.svg", "svg");
      expect(toast.success).toHaveBeenCalledWith("Diagram exported as svg successfully");
      expect(store.getState().isExporting).toBe(false);
    });

    it("shows error toast when downloadImage throws an exception during SVG export", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockSvgData = "data:image/svg+xml;utf8,<svg></svg>";
      vi.mocked(renderToNativeSvg).mockReturnValue(mockSvgData);
      vi.mocked(downloadImage).mockImplementation(() => {
        throw new Error("Download error");
      });

      const exportPromise = result.current.exportAsSvg("diagram.svg");

      store.setState({ isExporting: true });
      const { result: activeResult } = renderHook(() => useCanvasExport(), {
        wrapper: createWrapper(store),
      });

      activeResult.current.ExportCanvas?.props.onReady({
        flowEl: mockFlowEl,
        width: 500,
        height: 400,
      });

      await exportPromise;

      expect(toast.error).toHaveBeenCalledWith("Failed to export diagram");
      consoleSpy.mockRestore();
    });
  });
});
