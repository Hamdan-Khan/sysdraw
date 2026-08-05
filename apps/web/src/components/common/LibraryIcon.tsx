import { sanitizeSvgString } from "@zero-sketch/canvas";
import { memo, useMemo } from "react";

export interface LibraryIconProps {
  svg?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const LibraryIconComponent = ({
  svg,
  size,
  className = "",
  style,
}: LibraryIconProps) => {
  const sizeStyle = size ? { width: size, height: size } : {};

  const sanitizedSvg = useMemo(() => {
    if (!svg) {
      return "";
    }
    return sanitizeSvgString(svg);
  }, [svg]);

  if (!svg) {
    return null;
  }
  return (
    <span
      className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:shrink-0 ${className}`}
      style={{ ...sizeStyle, ...style }}
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
};

export const LibraryIcon = memo(LibraryIconComponent);
