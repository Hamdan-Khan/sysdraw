import { cn, downloadFile } from "@/lib/utils";
import { FILE_EXTENSIONS } from "@zero-sketch/common";
import { describe, expect, it, vi } from "vitest";

describe("lib/utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-2 py-1", "bg-blue-500", { "text-white": true })).toBe(
        "px-2 py-1 bg-blue-500 text-white",
      );
    });
  });

  describe("downloadFile", () => {
    it("creates an anchor element and triggers download", () => {
      const clickSpy = vi.fn();
      const mockAnchor = {
        href: "",
        download: "",
        click: clickSpy,
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      vi.spyOn(document.body, "appendChild").mockImplementation(
        () => mockAnchor,
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        () => mockAnchor,
      );

      downloadFile(
        "data:image/png;base64,123",
        "my-canvas",
        FILE_EXTENSIONS.PNG,
      );

      expect(mockAnchor.download).toBe("my-canvas.png");
      expect(clickSpy).toHaveBeenCalled();
    });

    it("does not duplicate file extension if fileName already has it", () => {
      const clickSpy = vi.fn();
      const mockAnchor = {
        href: "",
        download: "",
        click: clickSpy,
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      vi.spyOn(document.body, "appendChild").mockImplementation(
        () => mockAnchor,
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        () => mockAnchor,
      );

      downloadFile(
        "data:image/png;base64,123",
        "my-canvas.png",
        FILE_EXTENSIONS.PNG,
      );

      expect(mockAnchor.download).toBe("my-canvas.png");
    });
  });
});
