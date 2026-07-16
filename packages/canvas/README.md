# Canvas

The base canvas package, exports the canvas component with all the canvas functionality.

```jsx
import { Canvas } from "@sysdraw/canvas";

function App() {
    const canvasState = { edges: [], nodes: [] };
    return (
        <Canvas canvasState={canvasState} />
    );
}

export default App;
```