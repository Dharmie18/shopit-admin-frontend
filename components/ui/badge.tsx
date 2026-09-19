import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pending' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#14212b]/10 text-[#14212b]',
    pending: 'bg-[#f2cf96] text-[#6b4712]',
    success: 'bg-[#d1fae5] text-[#065f46]',
    warning: 'bg-[#fed7aa] text-[#9a3412]',
    danger: 'bg-[#fee2e2] text-[#991b1b]',
    info: 'bg-[#e0ee56] text-[#14212b]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]',
        variants[variant],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
