import { RefObject } from "react";

interface DndWrapperProps {
  wrapperRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * Drag n Drop wrapper
 */
export const DndWrapper = ({ wrapperRef, children, onDrop, onDragOver }: DndWrapperProps) => {
  return (
    <div className="w-full h-full" ref={wrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
      {children}
    </div>
  );
};
