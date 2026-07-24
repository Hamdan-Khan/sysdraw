import { Canvas, createCanvasStore } from "@sysdraw/canvas";
import { LibraryRegistry } from "@sysdraw/models";

function App() {
  const canvasState = createCanvasStore({ nodes: [], edges: [] });
  const libraryRegistry = new LibraryRegistry();

  return <Canvas libraryRegistry={libraryRegistry} canvasState={canvasState} />;
}

export default App;
