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