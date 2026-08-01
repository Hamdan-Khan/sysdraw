import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type TooltipDirection = "up" | "down" | "left" | "right";

const directionStyles: Record<
  TooltipDirection,
  { transform: string; origin: string; arrow: string }
> = {
  up: {
    transform: "translate(-50%, -100%)",
    origin: "origin-bottom",
    arrow: "top-full left-1/2 -translate-x-1/2 border-t-black/90",
  },
  down: {
    transform: "translate(-50%, 0)",
    origin: "origin-top",
    arrow: "bottom-full left-1/2 -translate-x-1/2 border-b-black/90",
  },
  left: {
    transform: "translate(-100%, -50%)",
    origin: "origin-right",
    arrow: "left-full top-1/2 -translate-y-1/2 border-l-black/90",
  },
  right: {
    transform: "translate(0, -50%)",
    origin: "origin-left",
    arrow: "right-full top-1/2 -translate-y-1/2 border-r-black/90",
  },
};

const TooltipComponent = ({
  text,
  direction = "up",
}: {
  text: string;
  direction?: TooltipDirection;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const spanRef = useRef<HTMLSpanElement>(null);

  const updateCoords = useCallback(() => {
    const parent = spanRef.current?.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if (direction === "up") {
      x = rect.left + rect.width / 2;
      y = rect.top - 8;
    } else if (direction === "down") {
      x = rect.left + rect.width / 2;
      y = rect.bottom + 8;
    } else if (direction === "left") {
      x = rect.left - 8;
      y = rect.top + rect.height / 2;
    } else if (direction === "right") {
      x = rect.right + 8;
      y = rect.top + rect.height / 2;
    }

    setCoords({ x, y });
  }, [direction]);

  useEffect(() => {
    const parent = spanRef.current?.parentElement;
    if (!parent) return;

    const handleMouseEnter = () => {
      updateCoords();
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("pointerenter", handleMouseEnter);
    parent.addEventListener("pointerleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      parent.removeEventListener("pointerenter", handleMouseEnter);
      parent.removeEventListener("pointerleave", handleMouseLeave);
    };
  }, [updateCoords]);

  // update coordinates on window/container scroll or window resize
  useEffect(() => {
    if (!isVisible) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isVisible, updateCoords]);

  const { transform, origin, arrow } = directionStyles[direction];

  return (
    <>
      {/* invisible anchor element to discover the parent container */}
      <span ref={spanRef} className="hidden" aria-hidden="true" />

      {isVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            style={{
              position: "fixed",
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform,
              zIndex: 99999,
            }}
            className={`pointer-events-none px-2 py-1 rounded-md bg-black/90 text-white text-xs font-medium whitespace-nowrap shadow-lg ${origin} animate-in fade-in-0 zoom-in-95 duration-100`}
          >
            {text}
            {/* arrow */}
            <span className={`absolute border-4 border-transparent ${arrow}`} />
          </span>,
          document.body,
        )}
    </>
  );
};

export const Tooltip = memo(TooltipComponent);
