import React from 'react';
import { X } from 'lucide-react';

interface CloseButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  className?: string;
}

export function CloseButton({
  onClick,
  ariaLabel = 'Fermer',
  className = '',
}: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 cursor-pointer bg-transparent text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground ${className}`}
    >
      <X size={16} strokeWidth={1.5} />
    </button>
  );
}

