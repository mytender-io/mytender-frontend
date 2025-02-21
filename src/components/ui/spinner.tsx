const Spinner = ({ className }: { className?: string }) => (
  <div
    className={`animate-spin h-6 w-6 border-[3px] border-current border-t-transparent rounded-full text-orange ${className}`}
    role="status"
    aria-label="loading"
  />
);

export { Spinner };
