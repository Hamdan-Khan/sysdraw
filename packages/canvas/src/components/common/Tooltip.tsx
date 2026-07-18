type TooltipDirection = "up" | "down" | "left" | "right";

const directionStyles: Record<
  TooltipDirection,
  { tooltip: string; origin: string; arrow: string }
> = {
  up: {
    tooltip: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    origin: "origin-bottom",
    arrow: "top-full left-1/2 -translate-x-1/2 border-t-black/90",
  },
  down: {
    tooltip: "top-full left-1/2 -translate-x-1/2 mt-2",
    origin: "origin-top",
    arrow: "bottom-full left-1/2 -translate-x-1/2 border-b-black/90",
  },
  left: {
    tooltip: "right-full top-1/2 -translate-y-1/2 mr-2",
    origin: "origin-right",
    arrow: "left-full top-1/2 -translate-y-1/2 border-l-black/90",
  },
  right: {
    tooltip: "left-full top-1/2 -translate-y-1/2 ml-2",
    origin: "origin-left",
    arrow: "right-full top-1/2 -translate-y-1/2 border-r-black/90",
  },
};

export const Tooltip = ({
  text,
  direction = "up",
}: {
  text: string;
  direction?: TooltipDirection;
}) => {
  const { tooltip, origin, arrow } = directionStyles[direction];

  return (
    <>
      <span
        className={`pointer-events-none absolute ${tooltip} px-2 py-1 rounded-md bg-black/90 text-white text-xs font-medium whitespace-nowrap opacity-0 scale-95 ${origin} transition-all duration-150 ease-out group-hover:opacity-100 group-hover:scale-100 shadow-lg z-50`}
      >
        {text}
        {/* arrow */}
        <span className={`absolute border-4 border-transparent ${arrow}`} />
      </span>
    </>
  );
};
