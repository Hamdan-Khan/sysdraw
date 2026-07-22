import { fireEvent, render, screen } from "@testing-library/react";
import { Position, ReactFlowProvider } from "@xyflow/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EdgeWrapper } from "../../components/edges/EdgeWrapper";
import { mockSetEdges, mockSetNodes } from "../utils/mocks";

describe("EdgeWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };

  const renderComponent = (ui: React.ReactNode) => {
    return render(<ReactFlowProvider>{ui}</ReactFlowProvider>);
  };

  it("renders edge label when label prop is provided", () => {
    renderComponent(<EdgeWrapper {...defaultProps} label="Test Connection" />);
    expect(screen.getByText("Test Connection")).toBeInTheDocument();
  });

  it("selects edge when label is clicked", () => {
    renderComponent(<EdgeWrapper {...defaultProps} label="Click Me" />);

    const labelElement = screen.getByText("Click Me");
    fireEvent.click(labelElement);

    expect(mockSetEdges).toHaveBeenCalledTimes(1);
    expect(mockSetNodes).toHaveBeenCalledTimes(1);

    const edgesUpdater = mockSetEdges.mock.calls[0][0];
    const initialEdges = [
      { id: "edge-1", selected: false },
      { id: "edge-2", selected: true },
    ];
    const updatedEdges = edgesUpdater(initialEdges);
    expect(updatedEdges).toEqual([
      { id: "edge-1", selected: true },
      { id: "edge-2", selected: false },
    ]);

    const nodesUpdater = mockSetNodes.mock.calls[0][0];
    const initialNodes = [
      { id: "node-1", selected: true },
      { id: "node-2", selected: false },
    ];
    const updatedNodes = nodesUpdater(initialNodes);
    expect(updatedNodes).toEqual([
      { id: "node-1", selected: false },
      { id: "node-2", selected: false },
    ]);
  });
});
