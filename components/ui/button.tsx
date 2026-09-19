import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-black uppercase tracking-[0.13em] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-2';

    const variants = {
      primary: 'bg-[#14212b] text-[#e0ee56] hover:bg-[#14212b]/90 active:scale-[0.99]',
      secondary: 'bg-[#e8e8e1] text-[#14212b] hover:bg-[#14212b]/10 border border-[#14212b]/15',
      accent: 'bg-[#e0ee56] text-[#14212b] hover:bg-[#d4e24a] shadow-sm',
      danger: 'bg-[#9a4e2c] text-[#f5f5f1] hover:bg-[#864324]',
      outline: 'border border-[#14212b]/25 text-[#14212b] hover:bg-[#14212b] hover:text-[#e0ee56]',
      ghost: 'text-[#14212b] hover:bg-[#14212b]/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[11px]',
      md: 'px-4 py-2.5 text-xs',
      lg: 'px-6 py-3.5 text-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);
Button.displayName = 'Button';
