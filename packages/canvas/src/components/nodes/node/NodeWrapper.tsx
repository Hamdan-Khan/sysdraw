import type { NodeHandleConfig } from "@sysdraw/models";
import { CommonNodeWrapper } from "../CommonNodeWrapper";

export interface NodeWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
}

export const NodeWrapper = ({ children, handles, selected }: NodeWrapperProps) => {
  return (
    <CommonNodeWrapper
      type="node"
      handles={handles}
      selected={selected}
      className="flex flex-col items-center justify-center min-w-10 min-h-10 relative"
      minWidth={40}
      minHeight={40}
      keepAspectRatio
      resizerBorderWidth={1}
    >
      {children}
    </CommonNodeWrapper>
  );
};
