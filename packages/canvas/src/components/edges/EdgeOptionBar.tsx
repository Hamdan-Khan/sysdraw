import { RegisteredEdges } from "@sysdraw/models";
import { Edge, MarkerType, useReactFlow } from "@xyflow/react";
import { ArrowRight, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Dropdown, Tooltip } from "../common";
import { edgeTypeOptions } from "./EdgeTypes";

interface EdgeOptionBarProps {
  edgeId: string;
}

export const EdgeOptionBar = ({ edgeId }: EdgeOptionBarProps) => {
  const { getEdge, setEdges, deleteElements } = useReactFlow();
  const edge = getEdge(edgeId);

  if (!edge) return null;

  const currentType = (edge.type ?? RegisteredEdges.STRAIGHT) as RegisteredEdges;
  const isAnimated = edge.animated;
  const currentMarker = edge.markerEnd;

  const updateEdge = (updater: (edge: Partial<Edge>) => Partial<Edge>) => {
    setEdges((edges) => edges.map((e) => (e.id === edgeId ? { ...e, ...updater(e) } : e)));
  };

  const handleDelete = () => {
    deleteElements({ edges: [{ id: edgeId }] });
    toast.success("Edge deleted.");
  };

  const handleToggleAnimate = () => {
    updateEdge((e) => ({ animated: !e.animated }));
  };

  const cycleMarker = () => {
    updateEdge((e) => {
      let nextMarker;
      if (!e.markerEnd) {
        nextMarker = { type: MarkerType.ArrowClosed };
      } else if (typeof e.markerEnd === "object" && e.markerEnd.type === MarkerType.ArrowClosed) {
        nextMarker = { type: MarkerType.Arrow };
      } else {
        nextMarker = undefined;
      }
      return { markerEnd: nextMarker };
    });
  };

  const handleTypeChange = (type: RegisteredEdges) => {
    updateEdge(() => ({ type }));
  };

  return (
    <div className="flex items-center gap-0.5 bg-surface p-1 rounded-lg border border-border shadow-md">
      <Dropdown
        options={edgeTypeOptions}
        value={currentType}
        onChange={handleTypeChange}
        aria-label="Edge type"
      />

      <div className="w-px h-4 bg-border mx-1" />

      <div className="relative flex items-center justify-center group">
        <button
          onClick={handleToggleAnimate}
          className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none ${
            isAnimated ? "text-primary bg-dim" : "text-secondary hover:text-primary hover:bg-dim"
          }`}
          aria-label="Animate"
        >
          <Zap size={16} />
        </button>
        <Tooltip text="Animate" />
      </div>

      <div className="relative flex items-center justify-center group">
        <button
          onClick={cycleMarker}
          className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none ${
            currentMarker ? "text-primary bg-dim" : "text-secondary hover:text-primary hover:bg-dim"
          }`}
          aria-label="Arrow"
        >
          <ArrowRight size={16} />
        </button>
        <Tooltip text="Arrow" />
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="relative flex items-center justify-center group">
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-dim transition-all flex items-center justify-center cursor-pointer outline-none"
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
        <Tooltip text="Delete" />
      </div>
    </div>
  );
};
