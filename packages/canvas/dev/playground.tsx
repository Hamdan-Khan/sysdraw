import { LibraryRegistry } from "@sysdraw/models";
import { Canvas } from "../src/components";
import { createCanvasStore } from "../src/store";

export const PlayGround = () => {
  const canvasState = createCanvasStore({ nodes: [], edges: [] });
  const registry = new LibraryRegistry();

  return <Canvas libraryRegistry={registry} canvasState={canvasState} />;
};
