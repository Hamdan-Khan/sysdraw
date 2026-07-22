import { RegisteredEdges } from "@sysdraw/models";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeEdge, makeNode, makeStore } from "./utils";

vi.unmock("zustand");

describe("setNodes", () => {
  it("replaces nodes with a direct array", () => {
    const store = makeStore([makeNode("a")]);
    const { setNodes } = store.getState();

    setNodes([makeNode("b"), makeNode("c")]);

    const { nodes } = store.getState();
    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.id)).toEqual(["b", "c"]);
  });

  it("applies a functional updater", () => {
    const store = makeStore([makeNode("a")]);
    const { setNodes } = store.getState();

    setNodes((prev) => [...prev, makeNode("b")]);

    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("keeps nodesMap synchronized when setNodes is called", () => {
    const store = makeStore([makeNode("a")]);
    expect(store.getState().nodesMap.get("a")).toBeDefined();

    const nodeB = makeNode("b");
    const nodeC = makeNode("c");
    store.getState().setNodes([nodeB, nodeC]);

    const { nodesMap } = store.getState();
    expect(nodesMap.size).toBe(2);
    expect(nodesMap.get("a")).toBeUndefined();
    expect(nodesMap.get("b")).toEqual(nodeB);
    expect(nodesMap.get("c")).toEqual(nodeC);
  });
});

describe("setEdges", () => {
  it("replaces edges with a direct array", () => {
    const store = makeStore([], [makeEdge("e1", "a", "b")]);
    const { setEdges } = store.getState();

    setEdges([makeEdge("e2", "c", "d")]);

    expect(store.getState().edges.map((e) => e.id)).toEqual(["e2"]);
  });

  it("applies a functional updater", () => {
    const store = makeStore([], [makeEdge("e1", "a", "b")]);
    const { setEdges } = store.getState();

    setEdges((prev) => [...prev, makeEdge("e2", "c", "d")]);

    expect(store.getState().edges.map((e) => e.id)).toEqual(["e1", "e2"]);
  });
});

describe("onNodesChange", () => {
  it("adds a node via an 'add' change", () => {
    const store = makeStore();
    const { onNodesChange } = store.getState();

    onNodesChange([{ type: "add", item: makeNode("n1") }]);

    expect(store.getState().nodes).toHaveLength(1);
    expect(store.getState().nodes[0].id).toBe("n1");
  });

  it("updates nodesMap when onNodesChange adds or removes nodes", () => {
    const store = makeStore([makeNode("n1")]);
    const { onNodesChange } = store.getState();

    onNodesChange([{ type: "add", item: makeNode("n2") }]);
    expect(store.getState().nodesMap.has("n2")).toBe(true);

    onNodesChange([{ type: "remove", id: "n1" }]);
    expect(store.getState().nodesMap.has("n1")).toBe(false);
  });
});

describe("isNodeLocked", () => {
  it("returns false for undefined, missing, or unlocked nodes", () => {
    const store = makeStore([makeNode("n1", { draggable: true }), makeNode("n2")]);
    const { isNodeLocked } = store.getState();

    expect(isNodeLocked()).toBe(false);
    expect(isNodeLocked("unknown")).toBe(false);
    expect(isNodeLocked("n1")).toBe(false);
    expect(isNodeLocked("n2")).toBe(false);
  });

  it("returns true when a node has draggable set to false", () => {
    const store = makeStore([makeNode("locked", { draggable: false })]);
    const { isNodeLocked } = store.getState();

    expect(isNodeLocked("locked")).toBe(true);
  });
});

describe("onEdgesChange", () => {
  it("adds an edge via an 'add' change", () => {
    const store = makeStore();
    const { onEdgesChange } = store.getState();

    onEdgesChange([{ type: "add", item: makeEdge("e1", "a", "b") }]);

    expect(store.getState().edges).toHaveLength(1);
    expect(store.getState().edges[0].id).toBe("e1");
  });

  it("removes an edge via a 'remove' change", () => {
    const store = makeStore([], [makeEdge("e1", "a", "b"), makeEdge("e2", "b", "c")]);
    const { onEdgesChange } = store.getState();

    onEdgesChange([{ type: "remove", id: "e1" }]);

    expect(store.getState().edges.map((e) => e.id)).toEqual(["e2"]);
  });
});

describe("globalEdgeType / setGlobalEdgeType", () => {
  it("defaults to straight", () => {
    const store = makeStore();
    expect(store.getState().globalEdgeType).toBe(RegisteredEdges.STRAIGHT);
  });

  it("updates globalEdgeType", () => {
    const store = makeStore();
    const { setGlobalEdgeType } = store.getState();

    setGlobalEdgeType(RegisteredEdges.BEZIER);

    expect(store.getState().globalEdgeType).toBe(RegisteredEdges.BEZIER);
  });
});

describe("globalEdgeAnimated / setGlobalEdgeAnimated", () => {
  it("defaults to false", () => {
    const store = makeStore();
    expect(store.getState().globalEdgeAnimated).toBe(false);
  });

  it("updates globalEdgeAnimated", () => {
    const store = makeStore();
    const { setGlobalEdgeAnimated } = store.getState();

    setGlobalEdgeAnimated(true);

    expect(store.getState().globalEdgeAnimated).toBe(true);
  });
});

describe("globalEdgeMarkerEnd / setGlobalEdgeMarkerEnd", () => {
  it("defaults to undefined", () => {
    const store = makeStore();
    expect(store.getState().globalEdgeMarkerEnd).toBeUndefined();
  });

  it("updates globalEdgeMarkerEnd", () => {
    const store = makeStore();
    const { setGlobalEdgeMarkerEnd } = store.getState();

    const marker = { type: "arrowclosed" as any };
    setGlobalEdgeMarkerEnd(marker);

    expect(store.getState().globalEdgeMarkerEnd).toEqual(marker);
  });
});

describe("commit / undo / redo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("commit pushes current store state into past and clears future", () => {
    const store = makeStore([makeNode("a")]);
    const { commit } = store.getState();

    commit();

    const { history } = store.getState();
    expect(history.past).toHaveLength(1);
    expect(history.past[0].nodes[0].id).toBe("a");
    expect(history.future).toHaveLength(0);
  });

  it("undo is a no-op when past is empty", () => {
    const store = makeStore([makeNode("a")]);
    const { undo } = store.getState();

    undo();

    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);
    expect(store.getState().history.past).toHaveLength(0);
  });

  it("undo restores previous snapshot and saves current state in future", () => {
    const store = makeStore([makeNode("prev")]);
    const { commit, undo, setNodes } = store.getState();

    commit();
    setNodes([makeNode("current")]);

    undo();

    const { nodes, nodesMap, history } = store.getState();
    expect(nodes.map((n) => n.id)).toEqual(["prev"]);
    expect(nodesMap.has("prev")).toBe(true);
    expect(nodesMap.has("current")).toBe(false);
    expect(history.past).toHaveLength(0);
    // future holds the state that was live before undo (i.e. "current")
    expect(history.future).toHaveLength(1);
    expect(history.future[0].nodes[0].id).toBe("current");
  });

  it("redo is a no-op when future is empty", () => {
    const store = makeStore([makeNode("a")]);
    const { redo } = store.getState();

    redo();

    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);
  });

  it("redo restores next snapshot and moves it to past", () => {
    const store = makeStore([makeNode("step-1")]);
    const { commit, undo, redo } = store.getState();

    // captures "step-1", undo saves "step-1" in future
    commit();
    undo();
    redo();

    const { nodes, history } = store.getState();
    expect(nodes.map((n) => n.id)).toEqual(["step-1"]);
    expect(history.past).toHaveLength(1);
    expect(history.future).toHaveLength(0);
  });

  it("commit after undo clears the future", () => {
    const store = makeStore([makeNode("a")]);
    const { commit, undo, setNodes } = store.getState();

    commit();
    undo();

    // committing a new change should wipe the future
    setNodes([makeNode("b")]);
    commit();

    expect(store.getState().history.future).toHaveLength(0);
    expect(store.getState().history.past[0].nodes[0].id).toBe("b");
  });

  it("full undo/redo round-trip preserves state correctly", () => {
    const store = makeStore([makeNode("initial")]);
    const { commit, undo, redo, setNodes } = store.getState();

    // captures "initial", then mutate to "a"
    commit();
    setNodes([makeNode("a")]);

    // captures "a", then mutate to "b"
    commit();
    setNodes([makeNode("b")]);

    // undo restores "a"
    undo();
    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);

    // undo restores "initial"
    undo();
    expect(store.getState().nodes.map((n) => n.id)).toEqual(["initial"]);

    // redo restores "a"
    redo();
    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);
    expect(store.getState().history.past).toHaveLength(1);
    expect(store.getState().history.past[0].nodes.map((n) => n.id)).toEqual(["initial"]);
    expect(store.getState().history.future.map((f) => f.nodes[0].id)).toEqual(["b"]);

    // second redo restores "b"
    redo();
    expect(store.getState().nodes.map((n) => n.id)).toEqual(["b"]);
    expect(store.getState().history.past.map((p) => p.nodes[0].id)).toEqual(["initial", "a"]);
    expect(store.getState().history.future).toHaveLength(0);

    // single undo from "b" should go straight back to "a"
    undo();
    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);
  });

  it("caps history at HISTORY_LIMIT (30) entries", () => {
    const store = makeStore();
    const { commit, setNodes } = store.getState();

    for (let i = 0; i < 35; i++) {
      setNodes([makeNode(`n${i}`)]);
      commit();
    }

    const { history } = store.getState();
    expect(history.past).toHaveLength(30);
    // oldest entries were dropped (0–4)
    expect(history.past[0].nodes[0].id).toBe("n5");
  });
});

describe("isInteractive / setIsInteractive", () => {
  it("defaults to true", () => {
    const store = makeStore();

    expect(store.getState().isInteractive).toBe(true);
  });

  it("setIsInteractive(false) locks the canvas", () => {
    const store = makeStore();
    const { setIsInteractive } = store.getState();

    setIsInteractive(false);

    expect(store.getState().isInteractive).toBe(false);
  });

  it("setIsInteractive(true) unlocks the canvas after locking", () => {
    const store = makeStore();
    const { setIsInteractive } = store.getState();

    setIsInteractive(false);
    setIsInteractive(true);

    expect(store.getState().isInteractive).toBe(true);
  });

  it("toggling interactivity does not affect nodes or edges", () => {
    const store = makeStore([makeNode("a")], [makeEdge("e1", "a", "b")]);
    const { setIsInteractive } = store.getState();

    setIsInteractive(false);

    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);
    expect(store.getState().edges.map((e) => e.id)).toEqual(["e1"]);
  });
});

describe("grid / setGrid", () => {
  it("defaults to true", () => {
    const store = makeStore();

    expect(store.getState().grid).toBe(true);
  });

  it("setGrid(false) hides the grid", () => {
    const store = makeStore();
    const { setGrid } = store.getState();

    setGrid(false);

    expect(store.getState().grid).toBe(false);
  });

  it("setGrid(true) shows the grid after hiding", () => {
    const store = makeStore();
    const { setGrid } = store.getState();

    setGrid(false);
    setGrid(true);

    expect(store.getState().grid).toBe(true);
  });
});
