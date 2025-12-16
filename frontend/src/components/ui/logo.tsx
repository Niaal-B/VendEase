export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <rect width="32" height="32" rx="6" fill="currentColor" className="opacity-10" />
        <path
          d="M16 8L10 12V20L16 24L22 20V12L16 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M10 12L16 16L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 16V24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="20" r="1.5" fill="currentColor" />
      </svg>
      <span className="text-xl font-bold tracking-tight">VendEase</span>
    </div>
  );
}

