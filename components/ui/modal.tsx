'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
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

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14212b]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full border border-[#14212b]/20 bg-[#f5f5f1] text-[#14212b] shadow-2xl animate-in zoom-in-95 duration-200',
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between border-b border-[#14212b]/15 p-5 bg-[#e8e8e1]/60">
          <div>
            {subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
                {subtitle}
              </p>
            )}
            <h3 className="text-xl font-black tracking-[-0.05em] uppercase text-[#14212b]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center border border-[#14212b]/20 hover:bg-[#14212b] hover:text-[#e0ee56] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
