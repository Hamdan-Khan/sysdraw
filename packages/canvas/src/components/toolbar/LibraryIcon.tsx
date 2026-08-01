import { NODE_ICON_CLASS_ID } from "@sysdraw/common";
import type { IconType } from "@sysdraw/models";
import DOMPurify from "dompurify";
import { memo, useMemo } from "react";

export interface LibraryIconProps {
  icon?: IconType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const LibraryIconComponent = ({
  icon,
  size,
  className = "",
  style,
}: LibraryIconProps) => {
  const sizeStyle = size ? { width: size, height: size } : {};

  const sanitizedSvg = useMemo(() => {
    if (!icon || icon.kind !== "svg") {
      return "";
    }
    return DOMPurify.sanitize(icon.value, { USE_PROFILES: { svg: true } });
  }, [icon]);

  if (!icon || !icon.value) {
    return null;
  }

  if (icon.kind === "svg") {
    return (
      <span
        className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:shrink-0 ${NODE_ICON_CLASS_ID} ${className}`}
        style={{ ...sizeStyle, ...style }}
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
      />
    );
  }

  if (icon.kind === "url") {
    return (
      <img
        src={icon.value}
        alt=""
        referrerPolicy="no-referrer"
        className={`object-contain shrink-0 ${NODE_ICON_CLASS_ID} ${className}`}
        style={{ ...sizeStyle, ...style }}
      />
    );
  }

  return null;
};

/**
 * Component to render a node icon from a LibraryNode definition.
 * Supports both raw SVG string and image URLs.
 */
export const LibraryIcon = memo(LibraryIconComponent);
