import { RegisteredEdges } from "@sysdraw/models";
import { Edge, MarkerType, useReactFlow } from "@xyflow/react";
import { ArrowRight, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useHistory } from "../../hooks";
import { Dropdown, Tooltip } from "../common";
import { edgeTypeOptions } from "./EdgeTypes";

interface EdgeOptionBarProps {
  edgeId: string;
}

type OptionBarButton = {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
};

export const EdgeOptionBar = ({ edgeId }: EdgeOptionBarProps) => {
  const { getEdge, setEdges, deleteElements } = useReactFlow();
  const edge = getEdge(edgeId);
  const { commit } = useHistory();

  if (!edge) {
    return null;
  }

  const currentType = (edge.type ?? RegisteredEdges.STRAIGHT) as RegisteredEdges;
  const isAnimated = edge.animated;
  const currentMarker = edge.markerEnd;

  const updateEdge = (updater: (edge: Partial<Edge>) => Partial<Edge>) => {
    setEdges((edges) => edges.map((e) => (e.id === edgeId ? { ...e, ...updater(e) } : e)));
  };

  const handleDelete = () => {
    commit();
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

  const buttons: OptionBarButton[] = [
    { icon: <Zap size={16} />, onClick: handleToggleAnimate, label: "Animate", active: isAnimated },
    {
      icon: <ArrowRight size={16} />,
      onClick: cycleMarker,
      label: "Arrow",
      active: !!currentMarker,
    },
    { icon: <Trash2 size={16} />, onClick: handleDelete, label: "Delete" },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-surface p-1 rounded-lg border border-border shadow-md">
      <div className="relative flex items-center justify-center group">
        <Dropdown
          options={edgeTypeOptions}
          value={currentType}
          onChange={handleTypeChange}
          aria-label="Edge type"
        />
        <Tooltip text="Edge type" />
      </div>

      {buttons.map(({ icon, onClick, label, active }) => (
        <div key={label} className="relative flex items-center justify-center group">
          <button
            onClick={onClick}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none ${
              active !== undefined
                ? active
                  ? "text-primary bg-dim"
                  : "text-secondary hover:text-primary hover:bg-dim"
                : "text-secondary hover:text-primary hover:bg-dim"
            }`}
            aria-label={label}
          >
            {icon}
          </button>
          <Tooltip text={label} />
        </div>
      ))}
    </div>
  );
};
