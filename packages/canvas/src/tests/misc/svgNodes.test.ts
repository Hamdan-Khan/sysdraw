import { CanvasNodeData } from "@/components/nodes/createNodeTypes";
import { renderGroupNode, renderStandardNode } from "@/lib/svg/nodes";
import { describe, expect, it } from "vitest";

describe("nodes SVG renderer functions", () => {
  describe("renderGroupNode", () => {
    it("renders group rect and label element when label is provided", () => {
      const nodeData: CanvasNodeData = {
        kind: "group",
        label: "Backend Cluster",
        color: "#ff0000",
      };

      const { rect, label } = renderGroupNode(nodeData, 300, 200);

      expect(rect).not.toBeNull();
      expect(rect?.tagName.toLowerCase()).toBe("rect");
      expect(rect?.getAttribute("width")).toBe("298");
      expect(rect?.getAttribute("height")).toBe("198");

      expect(label).not.toBeNull();
      expect(label?.tagName.toLowerCase()).toBe("g");
      expect(label?.querySelector("text")?.textContent).toBe("Backend Cluster");
    });

    it("returns null for label when label is not provided", () => {
      const nodeData: CanvasNodeData = {
        kind: "group",
      };

      const { rect, label } = renderGroupNode(nodeData, 300, 200);

      expect(rect).not.toBeNull();
      expect(label).toBeNull();
    });
  });

  describe("renderStandardNode", () => {
    it("renders title text element and url icon", () => {
      const nodeData: CanvasNodeData = {
        kind: "node",
        title: "API Server",
        icon: { kind: "url", value: "https://example.com/icon.png" },
      };

      const { icon, text } = renderStandardNode(nodeData, 120, 80);

      expect(icon).not.toBeNull();
      expect(icon?.tagName.toLowerCase()).toBe("image");
      expect(icon?.getAttribute("href")).toBe("https://example.com/icon.png");

      expect(text).not.toBeNull();
      expect(text?.tagName.toLowerCase()).toBe("text");
      expect(text?.textContent).toBe("API Server");
    });

    it("renders svg icon when icon kind is svg", () => {
      const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>`;
      const nodeData: CanvasNodeData = {
        kind: "node",
        icon: { kind: "svg", value: rawSvg },
      };

      const { icon, text } = renderStandardNode(nodeData, 100, 100);

      expect(icon).not.toBeNull();
      expect(icon?.tagName.toLowerCase()).toBe("svg");
      expect(text).toBeNull();
    });

    it("returns null for icon and text when neither is provided", () => {
      const nodeData: CanvasNodeData = {
        kind: "node",
      };

      const { icon, text } = renderStandardNode(nodeData, 100, 100);

      expect(icon).toBeNull();
      expect(text).toBeNull();
    });
  });
});
