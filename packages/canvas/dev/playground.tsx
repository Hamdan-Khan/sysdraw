import { Canvas } from "../src/components";

export const PlayGround = () => {
  const canvasState = { nodes: [], edges: [] };

  return <Canvas canvasState={canvasState} />;
};
