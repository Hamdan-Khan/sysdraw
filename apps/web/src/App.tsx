import { Canvas, createCanvasStore } from "@sysdraw/canvas";

function App() {
  const canvasState = createCanvasStore({ nodes: [], edges: [] });

  return (
    <>
      <Canvas canvasState={canvasState} />
    </>
  );
}

export default App;
