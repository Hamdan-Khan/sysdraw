import { NodeKinds } from "../types";

type IconSourceType = "svg" | "url" | string;

type IconType = { kind: IconSourceType; value: string };

interface LibraryNode {
  id: string;
  type: NodeKinds | string;
  label: string;
  icon?: IconType;
  description?: string;
}

interface LibraryMetadata {
  id: string;
  name: string;
  version: string;
  icon?: IconSourceType;
}

type LibraryManifest = {
  nodes: LibraryNode[];
} & LibraryMetadata;

export type { IconType, LibraryManifest, LibraryMetadata, LibraryNode };
