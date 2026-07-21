import { RegisteredEdges } from "@sysdraw/models";
import { EdgeTypes } from "@xyflow/react";
import { CornerDownRight, LucideIcon, Route, Slash, Spline } from "lucide-react";
import { EdgePropsType } from "../canvas";
import { DropdownOption } from "../common";
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

export const edgeTypeOptions: DropdownOption<RegisteredEdges>[] = Object.entries(
  edgeTypeMetadata,
).map(([value, metadata]) => ({
  value: value as RegisteredEdges,
  label: metadata.label,
  icon: metadata.icon,
}));

/**
 * map of all registered edge type components
 */
export const edgeTypes: EdgeTypes = Object.values(RegisteredEdges).reduce((acc, edgeType) => {
  acc[edgeType] = (props: EdgePropsType) => <EdgeWrapper {...props} />;
  return acc;
}, {} as EdgeTypes);
