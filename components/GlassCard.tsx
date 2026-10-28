import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  glow = false,
  hoverEffect = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 relative overflow-hidden',
        hoverEffect && 'hover:-translate-y-1 transition-all duration-300',
        glow && 'shadow-[0_0_30px_-5px_rgba(255,157,0,0.25)] border-hotbee-500/40',
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-hotbee-500/20 rounded-full blur-2xl pointer-events-none" />
      )}
      {children}
    </div>
  );
};
