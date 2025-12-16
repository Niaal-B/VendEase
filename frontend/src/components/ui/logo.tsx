export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3.5 ${className || ""}`}>
      <div className="relative flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="veGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          
          {/* Professional geometric V - clean and modern */}
          <path
            d="M24 4L8 16V32L24 44L40 32V16L24 4Z"
            fill="url(#veGradient)"
          />
          
          {/* Subtle inner highlight for dimension */}
          <path
            d="M24 10L14 17V30L24 37L34 30V17L24 10Z"
            fill="white"
            className="opacity-15"
          />
          
          {/* Central connection hub - represents management center */}
          <circle cx="24" cy="24" r="2.5" fill="white" className="opacity-95" />
          
          {/* Minimal connection lines - represents vendor network */}
          <path
            d="M14 17L24 24L34 17"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-35"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-foreground">Vend</span>
          <span className="text-primary">Ease</span>
        </span>
        <span className="text-[9px] font-semibold text-muted-foreground tracking-[0.15em] uppercase mt-0.5">
          Vendor Management
        </span>
      </div>
    </div>
  );
}



