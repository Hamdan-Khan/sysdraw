import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EdgeOptionBar } from "../../components/edges/EdgeOptionBar";
import { mockGetEdge, mockSetEdges } from "../utils/mocks";

const mockCommit = vi.fn();

vi.mock("../../hooks/useHistory", () => ({
  useHistory: () => ({
    commit: mockCommit,
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
  }),
}));

describe("EdgeOptionBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEdge.mockImplementation((id: string) => ({ id, type: "straight", label: "" }));
  });

  it("renders label toggle button and opens popover on click", () => {
    mockGetEdge.mockReturnValue({ id: "e1", type: "straight", label: "Initial Label" });

    render(<EdgeOptionBar edgeId="e1" />);

    const labelButton = screen.getAllByRole("button", { name: "Label" })[0];
    expect(labelButton).toBeInTheDocument();

    // Click label button to open popover
    fireEvent.click(labelButton);

    const input = screen.getByPlaceholderText("Edge label...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Initial Label");
  });

  it("updates label input in real time and debounces updating edge state", () => {
    vi.useFakeTimers();
    mockGetEdge.mockReturnValue({ id: "e1", type: "straight", label: "" });

    render(<EdgeOptionBar edgeId="e1" />);

    const labelButton = screen.getAllByRole("button", { name: "Label" })[0];
    fireEvent.click(labelButton);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const input = screen.getByPlaceholderText("Edge label...");
    fireEvent.change(input, { target: { value: "New Label" } });

    expect(input).toHaveValue("New Label");
    expect(mockCommit).toHaveBeenCalledTimes(1);

    // Prior to timer firing, setEdges hasn't been called yet for debounced update
    expect(mockSetEdges).not.toHaveBeenCalled();

    // Fast-forward time past 250ms debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockSetEdges).toHaveBeenCalledTimes(1);
    const edgesUpdater = mockSetEdges.mock.calls[0][0];
    const updated = edgesUpdater([{ id: "e1", label: "" }]);
    expect(updated[0].label).toBe("New Label");
    vi.useRealTimers();
  });

  it("flushes update immediately on Enter key press", () => {
    mockGetEdge.mockReturnValue({ id: "e1", type: "straight", label: "" });

    render(<EdgeOptionBar edgeId="e1" />);

    const labelButton = screen.getAllByRole("button", { name: "Label" })[0];
    fireEvent.click(labelButton);

    const input = screen.getByPlaceholderText("Edge label...");
    fireEvent.change(input, { target: { value: "Flushed Label" } });

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockSetEdges).toHaveBeenCalledTimes(1);
    const edgesUpdater = mockSetEdges.mock.calls[0][0];
    const updated = edgesUpdater([{ id: "e1", label: "" }]);
    expect(updated[0].label).toBe("Flushed Label");

    // Popover should close on Enter
    expect(screen.queryByPlaceholderText("Edge label...")).not.toBeInTheDocument();
  });

  it("reverts input value on Escape key press", () => {
    mockGetEdge.mockReturnValue({ id: "e1", type: "straight", label: "Original" });

    render(<EdgeOptionBar edgeId="e1" />);

    const labelButton = screen.getAllByRole("button", { name: "Label" })[0];
    fireEvent.click(labelButton);

    const input = screen.getByPlaceholderText("Edge label...");
    fireEvent.change(input, { target: { value: "Changed" } });

    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

    // Popover should close
    expect(screen.queryByPlaceholderText("Edge label...")).not.toBeInTheDocument();
  });
});
