import React from 'react';
import { Card } from './card';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className = '',
  icon,
  title,
  description,
  action,
  ...props
}) => {
  return (
    <Card
      className={`flex flex-col items-center justify-center text-center p-8 border-dashed border-2 bg-transparent ${className}`}
      glass={false}
      {...props}
    >
      {icon && <div className="text-muted-foreground mb-4 p-3 bg-secondary rounded-full">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </Card>
  );
};
