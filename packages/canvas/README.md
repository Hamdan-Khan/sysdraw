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

- [ ] add locking nodes functionality
- [x] add custom context menu on right click
- [x] add keyboard shortcuts in root component
- [x] improve context-menu (right click) wroking i.e. it should auto-select the node on which right click is performed, should not open when clicked on non canvas elements (toolbar, etc.)
- [ ] make import of icons (nodes/edges) pluggable
- [ ] if context menu is opened over a selected nodes group, its options (such as edge type, animation, arrow, etc.) should affect all the edges inside the selection.
- [x] if context menu is opened outside a selection,it should be un-selected
- [ ] clicking a node on the toolbar should drop it in the middle of the screen
- [ ] dropping a node from sidebar on a group should reparent it
- [ ] add labels on edges
- [x] fix multi nodes on ctrl+v paste
- [ ] remove barrel imports for components
- [ ] add edges arrow head option in the option bar
- [ ] export as png, svg and .sysdraw
- [ ] optimize undo/redo history state
