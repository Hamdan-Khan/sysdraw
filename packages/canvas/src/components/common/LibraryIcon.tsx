import type { IconType } from "@sysdraw/models";

export interface LibraryIconProps {
  icon?: IconType;
  size?: number;
  className?: string;
}

/**
 * Component to render a node icon from a LibraryNode definition.
 * Supports both raw SVG string and image URLs.
 */
export const LibraryIcon = ({ icon, size = 24, className = "" }: LibraryIconProps) => {
  if (!icon || !icon.value) return null;

  if (icon.kind === "svg") {
    return (
      <span
        className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:shrink-0 ${className}`}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: icon.value }}
      />
    );
  }

  if (icon.kind === "url") {
    return (
      <img
        src={icon.value}
        alt=""
        className={`object-contain shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return null;
};
