import { RegisteredEdges } from "@sysdraw/models";
import { HttpEdgeComponent } from "./Http";

export const edgeTypes = {
  [RegisteredEdges.HTTP_CALL]: HttpEdgeComponent,
};
