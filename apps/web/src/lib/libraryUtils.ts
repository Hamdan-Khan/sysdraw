import { sanitizeSvgString } from "@zero-sketch/canvas";
import { LibraryManifest, LibraryNode } from "@zero-sketch/models";
import { nanoid } from "nanoid";

export function downloadJson(data: object, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface BuilderFormState {
  name: string;
  description: string;
  version: string;
  tags: string;
  nodes: {
    id: string;
    label: string;
    description?: string;
    type: "node" | "group";
    svgContent: string;
  }[];
}

export function assembleLibraryManifest(
  form: BuilderFormState,
): LibraryManifest {
  const uniqueId = nanoid();
  const tagsArray = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const libraryNodes: LibraryNode[] = form.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    description: n.description,
    type: n.type,
    icon: n.svgContent
      ? {
          kind: "svg",
          value: sanitizeSvgString(n.svgContent),
        }
      : undefined,
  }));

  return {
    id: uniqueId,
    name: form.name.trim(),
    version: form.version.trim() || "1.0.0",
    description: form.description.trim(),
    tags: tagsArray.length > 0 ? tagsArray : [],
    nodes: libraryNodes,
  };
}

export { sanitizeSvgString };
