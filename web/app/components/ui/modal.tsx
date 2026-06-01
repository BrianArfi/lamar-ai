'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop click close handler */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />
      
      <Card
        className={`w-full ${widthClasses[maxWidth]} relative z-10 animate-fade-in flex flex-col max-h-[90vh] overflow-hidden`}
        glass={true}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          {title ? (
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-secondary rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Body content */}
        <div className="py-4 overflow-y-auto pr-1 flex-1">
          {children}
        </div>
      </Card>
    </div>
  );
};
