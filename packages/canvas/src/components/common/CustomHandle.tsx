import { Handle, Position, useViewport, type HandleProps } from "@xyflow/react";

const ARROW_ROTATION: Record<Position, number> = {
  [Position.Top]: -90,
  [Position.Right]: 0,
  [Position.Bottom]: 90,
  [Position.Left]: 180,
};

export const CustomHandle = ({
  position,
  isHovered,
  ...props
}: HandleProps & {
  isHovered: boolean;
}) => {
  const { zoom } = useViewport();

  return (
    <Handle position={position} {...props} className="custom-handle">
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
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>
    </Handle>
  );
};
