export const Tooltip = ({ text }: { text: string }) => {
  return (
    <>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-black/90 text-white text-xs font-medium whitespace-nowrap opacity-0 scale-95 origin-bottom transition-all duration-150 ease-out group-hover:opacity-100 group-hover:scale-100 shadow-lg z-50">
        {text}
        {/* arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
      </span>
    </>
  );
};
