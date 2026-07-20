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
- [] if context menu is opened over a selected nodes group, its options (such as edge type, animation, arrow, etc.) should affect all the edges inside the selection.
- [] if context menu is opened outside a selection,it should be un-selected
- [] clicking a node on the toolbar should drop it in the middle of the screen
- [] dropping a node from sidebar on a group should reparent it
- [] add labels on edges
- [] fix multi nodes on ctrl+v paste
