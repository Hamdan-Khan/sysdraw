import {
  Handle,
  Position,
  useNodeConnections,
  useViewport,
  type HandleProps,
} from "@xyflow/react";
import { HANDLE_DOT_CLASS_ID } from "@zero-sketch/common";
import { memo } from "react";

const ARROW_ROTATION: Record<Position, number> = {
  [Position.Top]: -90,
  [Position.Right]: 0,
  [Position.Bottom]: 90,
  [Position.Left]: 180,
};

/**
 * for some reason, dots are rendered a bit far from the edge if we center it (50% 50%)
 * on the handle, so we adjust the position using offsets
 */
const DOT_POSITION: Record<Position, { top: string; left: string }> = {
  [Position.Top]: { top: "30%", left: "50%" },
  [Position.Right]: { top: "50%", left: "70%" },
  [Position.Bottom]: { top: "70%", left: "50%" },
  [Position.Left]: { top: "50%", left: "30%" },
};

export interface CustomHandleProps extends HandleProps {
  isHovered: boolean;
}

export const CustomHandle = memo(
  ({ position, isHovered, ...props }: CustomHandleProps) => {
    const { zoom } = useViewport();
    const connections = useNodeConnections({
      handleType: props.type,
      handleId: props.id!,
    });
    const isConnected = connections.length > 0;
    const { top, left } = DOT_POSITION[position];

    return (
      <Handle position={position} {...props} className="custom-handle">
        {isConnected && (
          // dot to denote a connected edge
          <svg
            className={HANDLE_DOT_CLASS_ID}
            width="6"
            height="6"
            viewBox="0 0 6 6"
            style={{
              position: "absolute",
              top,
              left,
              transform: `translate(-50%, -50%) scale(${2 / (zoom + 0.6)})`,
              pointerEvents: "none",
              opacity: isHovered ? 0 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <circle cx="3" cy="3" r="2.5" fill="#555" />
          </svg>
        )}
        <svg
          className="custom-handle__arrow"
          viewBox="0 -8 20 16"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: `scale(${2 / (zoom + 0.5)}) rotate(${ARROW_ROTATION[position]}deg)`,
          }}
        >
          <path
            d="M0 -2.5 H11 L11 -6 L19 0 L11 6 L11 2.5 H0 Z"
            fill="#555"
            stroke="currentColor"
            strokeWidth={1}
            strokeLinejoin="round"
            opacity={0.7}
          />
        </svg>
      </Handle>
    );
  },
);
