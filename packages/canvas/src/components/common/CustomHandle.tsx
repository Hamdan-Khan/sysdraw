import { Handle, Position, useNodeConnections, useViewport, type HandleProps } from "@xyflow/react";
import { memo, useState } from "react";

const ARROW_ROTATION: Record<Position, number> = {
  [Position.Top]: -90,
  [Position.Right]: 0,
  [Position.Bottom]: 90,
  [Position.Left]: 180,
};

export const CustomHandle = memo(({ position, ...props }: HandleProps) => {
  const { zoom } = useViewport();
  const [isHovered, setIsHovered] = useState(false);
  console.log(props.id);

  const connections = useNodeConnections({ handleType: props.type, handleId: props.id! });
  const isConnected = connections.length > 0;

  return (
    <Handle
      position={position}
      {...props}
      className="custom-handle"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isConnected && (
        // dot to denote a connected edge
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "6px",
            height: "6px",
            transform: `scale(${2 / (zoom + 0.6)}) translate(-50%, -50%)`,
            backgroundColor: "#555",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: isHovered ? 0 : 1,
            transition: "opacity 0.15s ease",
          }}
        />
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
          // fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>
    </Handle>
  );
});
