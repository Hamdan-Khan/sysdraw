import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useShortcuts } from "../hooks";
import { mockSetEdges, mockSetNodes } from "./mocks";
import { makeEdge, makeNode, makeStore } from "./utils";

/** fires a keydown on window with the given modifier + key */
const fireKey = (key: string, modifier: "ctrlKey" | "metaKey" = "ctrlKey") =>
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        ctrlKey: modifier === "ctrlKey",
        metaKey: modifier === "metaKey",
      }),
    );
  });

/** fires a keydown directly on a DOM element (so e.target === el) */
const fireKeyOn = (el: Element, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, ctrlKey: true, bubbles: true }));
  });

/** fires a contextmenu event at (x, y), optionally on a specific element */
const fireContextMenu = (x = 100, y = 200, target: Element = document.body) =>
  act(() => {
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: x, clientY: y }));
  });

const mockCopy = vi.fn();
const mockPaste = vi.fn();

vi.mock("../hooks/useCopyPaste", () => ({
  useCopyPaste: () => ({ copy: mockCopy, paste: mockPaste }),
}));

describe("useShortcuts", () => {
  // unmount + clear between every test so listener counts never bleed across tests
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    vi.clearAllMocks();
  });

  const mount = (canvasState: any = {} as any) => {
    const hook = renderHook(() => useShortcuts(canvasState));
    unmount = hook.unmount;
    return hook;
  };

  describe("keyboard shortcuts", () => {
    it("calls copy() on Ctrl+C", () => {
      mount();
      fireKey("c");
      expect(mockCopy).toHaveBeenCalledOnce();
    });

    it("calls copy() on Meta+C (macOS)", () => {
      mount();
      fireKey("c", "metaKey");
      expect(mockCopy).toHaveBeenCalledOnce();
    });

    it("calls paste() on Ctrl+V", () => {
      mount();
      fireKey("v");
      expect(mockPaste).toHaveBeenCalledOnce();
    });

    it("selects all nodes and edges on Ctrl+A", () => {
      const store = makeStore([makeNode("a"), makeNode("b")], [makeEdge("e1", "a", "b")]);
      mount(store);

      fireKey("a");

      // invoke mockSetNodes/mockSetEdges receive updater callbacks to inspect the result
      expect(mockSetNodes).toHaveBeenCalledOnce();
      const updatedNodes = mockSetNodes.mock.calls[0][0]([makeNode("a"), makeNode("b")]);
      expect(updatedNodes.every((n: any) => n.selected)).toBe(true);

      expect(mockSetEdges).toHaveBeenCalledOnce();
      const updatedEdges = mockSetEdges.mock.calls[0][0]([makeEdge("e1", "a", "b")]);
      expect(updatedEdges.every((e: any) => e.selected)).toBe(true);
    });

    it("ignores unrelated modifier+key combos", () => {
      mount();
      // not handled
      fireKey("l");
      expect(mockCopy).not.toHaveBeenCalled();
      expect(mockPaste).not.toHaveBeenCalled();
      expect(mockSetNodes).not.toHaveBeenCalled();
    });

    it("does nothing when no modifier key is held", () => {
      mount();
      act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "c", bubbles: true })));
      expect(mockCopy).not.toHaveBeenCalled();
    });
  });

  describe("editable element guard", () => {
    const cases = [
      { name: "INPUT", tag: "input" },
      { name: "TEXTAREA", tag: "textarea" },
    ] as const;

    cases.forEach(({ name, tag }) => {
      it(`ignores Ctrl+C when focus is inside a ${name}`, () => {
        mount();
        const el = document.createElement(tag);
        document.body.appendChild(el);
        fireKeyOn(el, "c");
        expect(mockCopy).not.toHaveBeenCalled();
        el.remove();
      });
    });

    it("the guard checks isContentEditable on the event target", () => {
      // jsdom doesn't implement isContentEditable, so we verify the handler
      // reads the right property by making it truthy via a spy
      mount();
      const el = document.createElement("div");
      document.body.appendChild(el);
      Object.defineProperty(el, "isContentEditable", { value: true, configurable: true });
      fireKeyOn(el, "c");
      expect(mockCopy).not.toHaveBeenCalled();
      el.remove();
    });
  });

  describe("context menu", () => {
    it("starts closed (null)", () => {
      const { result } = mount();
      expect(result.current.contextMenu).toBeNull();
    });

    it("opens with the right-click coordinates", () => {
      const { result } = mount();
      fireContextMenu(150, 250);
      expect(result.current.contextMenu).toEqual({ x: 150, y: 250 });
    });

    it("updates to the latest right-click position", () => {
      const { result } = mount();
      fireContextMenu(10, 20);
      fireContextMenu(300, 400);
      expect(result.current.contextMenu).toEqual({ x: 300, y: 400 });
    });

    it("closeContextMenu resets state to null", () => {
      const { result } = mount();
      fireContextMenu(100, 200);
      act(() => result.current.closeContextMenu());
      expect(result.current.contextMenu).toBeNull();
    });

    it("does not open when the target has [data-no-context-menu]", () => {
      const { result } = mount();
      const el = document.createElement("div");
      el.setAttribute("data-no-context-menu", "");
      document.body.appendChild(el);
      fireContextMenu(100, 200, el);
      expect(result.current.contextMenu).toBeNull();
      el.remove();
    });

    it("does not open when the target is a descendant of [data-no-context-menu]", () => {
      const { result } = mount();
      const parent = document.createElement("div");
      parent.setAttribute("data-no-context-menu", "");
      const child = document.createElement("span");
      parent.appendChild(child);
      document.body.appendChild(parent);
      fireContextMenu(100, 200, child);
      expect(result.current.contextMenu).toBeNull();
      parent.remove();
    });
  });

  describe("cleanup", () => {
    it("removes the keydown listener on unmount", () => {
      const { unmount: doUnmount } = mount();
      doUnmount();
      // already done, skip afterEach unmount
      unmount = () => {};
      fireKey("c");
      expect(mockCopy).not.toHaveBeenCalled();
    });

    it("removes the contextmenu listener on unmount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount: doUnmount } = mount();
      doUnmount();
      unmount = () => {};

      // every event type that was added must also have been removed
      const added = addSpy.mock.calls.map(([type]) => type);
      const removed = removeSpy.mock.calls.map(([type]) => type);
      added.forEach((type) => expect(removed).toContain(type));

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });
});
