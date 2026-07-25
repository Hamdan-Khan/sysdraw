import { LibraryRegistry } from "@sysdraw/models";
import { Canvas } from "../src/components/canvas/Canvas";
import { createCanvasStore } from "../src/store/store";

export const PlayGround = () => {
  const canvasState = createCanvasStore({ nodes: [], edges: [] });
  const registry = new LibraryRegistry();

  return <Canvas libraryRegistry={registry} canvasState={canvasState} />;
};
