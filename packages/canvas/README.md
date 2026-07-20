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

## Todos

- [] add locking nodes functionality
- [] add custom context menu on right click
- [] add keyboard shortcuts in root component
- [] improve context-menu (right click) wroking i.e. it should auto-select the node on which right click is performed, should not open when clicked on non canvas elements (toolbar, etc.)
- [] make import of icons (nodes/edges) pluggable