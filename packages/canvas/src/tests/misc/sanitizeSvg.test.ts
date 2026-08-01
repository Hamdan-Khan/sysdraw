import { sanitizeSvgString } from "@/lib/sanitizeSvg";
import { describe, expect, it } from "vitest";

describe("sanitizeSvgString", () => {
  it("returns empty string when input is empty or falsy", () => {
    expect(sanitizeSvgString("")).toBe("");
  });

  it("preserves safe SVG elements and attributes", () => {
    const safeSvg =
      '<svg width="24" height="24"><path d="M0 0h24v24H0z"/></svg>';
    const sanitized = sanitizeSvgString(safeSvg);
    expect(sanitized).toContain("<svg");
    expect(sanitized).toContain("<path");
  });

  it("strips malicious script tags from SVG", () => {
    const dangerousSvg =
      '<svg><script>alert("xss")</script><rect width="10" height="10"/></svg>';
    const sanitized = sanitizeSvgString(dangerousSvg);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert");
    expect(sanitized).toContain("<rect");
  });

  it("strips inline event handlers from SVG elements", () => {
    const dangerousSvg =
      '<svg><rect width="10" height="10" onload="alert(1)"/></svg>';
    const sanitized = sanitizeSvgString(dangerousSvg);
    expect(sanitized).not.toContain("onload");
    expect(sanitized).not.toContain("alert");
  });
});
