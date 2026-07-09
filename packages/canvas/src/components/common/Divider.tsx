interface DividerProps {
  className?: string;
}

export const Divider = ({ className = "" }: DividerProps) => {
  return <div className={`h-px bg-border ${className}`} />;
};
