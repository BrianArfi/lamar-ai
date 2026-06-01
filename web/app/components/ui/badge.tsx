import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  glow?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', glow = false, children, ...props }, ref) => {
    
    const baseStyle = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border";
    
    const variants = {
      default: "bg-secondary text-secondary-foreground border-border",
      primary: "bg-primary/10 text-primary border-primary/20",
      success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      info: "bg-sky-500/10 text-sky-400 border-sky-500/20"
    };

    const glowColors = {
      default: "bg-secondary-foreground",
      primary: "bg-primary shadow-[0_0_8px_#a78bfa]",
      success: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      warning: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
      danger: "bg-rose-400 shadow-[0_0_8px_#f43f5e]",
      info: "bg-sky-400 shadow-[0_0_8px_#38bdf8]"
    };

    return (
      <span
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${className}`}
        {...props}
      >
        {glow && <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${glowColors[variant]}`} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
