import type { NodeHandleConfig } from "@sysdraw/models";
import { CommonNodeWrapper } from "../CommonNodeWrapper";

export interface NodeWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
  width?: number;
  height?: number;
}

export const NodeWrapper = ({ children, handles, selected, width, height }: NodeWrapperProps) => {
  return (
    <CommonNodeWrapper
      type="node"
      handles={handles}
      selected={selected}
      className="flex flex-col items-center justify-center relative w-full h-full"
      style={{
        width: width || 48,
        height: height || 48,
      }}
      minWidth={40}
      minHeight={40}
      keepAspectRatio
      resizerBorderWidth={1}
    >
      {children}
    </CommonNodeWrapper>
  );
};
