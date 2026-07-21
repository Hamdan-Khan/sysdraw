import type { NodeHandleConfig } from "@sysdraw/models";
import { CommonNodeWrapper } from "../CommonNodeWrapper";

export interface GroupWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
  width?: number;
  height?: number;
}

export const GroupWrapper = ({ children, handles, selected, width, height }: GroupWrapperProps) => {
  return (
    <CommonNodeWrapper
      type="group"
      handles={handles}
      selected={selected}
      className="relative w-full h-full"
      style={{
        width: width || 400,
        height: height || 300,
      }}
      minWidth={200}
      minHeight={150}
      resizerBorderWidth={0.8}
    >
      {children}
    </CommonNodeWrapper>
  );
};
