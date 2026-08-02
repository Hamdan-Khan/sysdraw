import { EdgePropsType } from "@/components/canvas/types";
import { DropdownOption } from "@/components/common/Dropdown";
import { EdgeTypes } from "@xyflow/react";
import { RegisteredEdges } from "@zero-sketch/models";
import {
  CornerDownRight,
  LucideIcon,
  Route,
  Slash,
  Spline,
} from "lucide-react";
import { EdgeWrapper } from "./EdgeWrapper";

export type EdgeTypeMetadata = {
  label: string;
  icon: LucideIcon;
};

export const edgeTypeMetadata: Record<RegisteredEdges, EdgeTypeMetadata> = {
  [RegisteredEdges.STRAIGHT]: { label: "Straight", icon: Slash },
  [RegisteredEdges.STEP]: { label: "Step", icon: CornerDownRight },
  [RegisteredEdges.SMOOTHSTEP]: { label: "Smooth Step", icon: Route },
  [RegisteredEdges.BEZIER]: { label: "Bezier", icon: Spline },
};

export const edgeTypeOptions: DropdownOption<RegisteredEdges>[] =
  Object.entries(edgeTypeMetadata).map(([value, metadata]) => ({
    value: value as RegisteredEdges,
    label: metadata.label,
    icon: metadata.icon,
  }));

/**
 * map of all registered edge type components
 */
export const edgeTypes: EdgeTypes = Object.values(RegisteredEdges).reduce(
  (acc, edgeType) => {
    acc[edgeType] = (props: EdgePropsType) => <EdgeWrapper {...props} />;
    return acc;
  },
  {} as EdgeTypes,
);
