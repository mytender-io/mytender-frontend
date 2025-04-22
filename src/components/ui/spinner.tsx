const Spinner = ({ 
  className,
  color = "text-orange" // Default color is orange, but can be overridden
}: { 
  className?: string;
  color?: string;
}) => (
  <div
    className={`animate-spin h-6 w-6 border-[3px] border-current border-t-transparent rounded-full ${color} ${className}`}
    role="status"
    aria-label="loading"
  />
);

export { Spinner };