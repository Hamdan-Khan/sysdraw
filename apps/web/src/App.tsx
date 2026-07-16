import { Canvas } from "@sysdraw/canvas";

function App() {
  return (
    <>
      <h1>SysDraw test</h1>
      <Canvas canvasState={{ edges: [], nodes: [] }} />
    </>
  );
}

export default App;
