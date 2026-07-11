import { Canvas } from "../src/components";
import { createCanvasStore } from "../src/store";

export const PlayGround = () => {
  const canvasState = createCanvasStore({ nodes: [], edges: [] });

  return <Canvas canvasState={canvasState} />;
};
