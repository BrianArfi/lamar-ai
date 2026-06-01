import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = false, glass = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl border border-border p-5 text-card-foreground transition-all duration-200
          ${glass ? 'glass-panel' : 'bg-card'}
          ${hoverable ? 'glass-panel-hover cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
