'use client';
import { AdminView } from '@/lib/types';
import { CircleUserRound, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
  adminName?: string;
  adminEmail?: string;
}

export function Navbar({
  currentView,
  onNavigate,
  onLogout,
  adminName = 'SI Admin',
  adminEmail = 'admin@shopit.co',
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#14212b]/15 bg-[#f5f5f1]/95 backdrop-blur">
      {/* Top Banner */}
      <div className="bg-[#14212b] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e0ee56]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-[#e0ee56]" />
            ShopIt Admin Console · Internal System Ops
          </span>
          <span className="hidden sm:inline-block">Auth Level: Superadmin (Role: admin)</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-xl font-black tracking-[-0.08em] cursor-pointer"
          >
            <span className="grid size-7 place-items-center bg-[#14212b] text-sm text-[#e0ee56] font-black">
              S
            </span>
            SHOP IT <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a4e2c] ml-1">/ ADMIN</span>
          </button>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 border-r border-[#14212b]/15 pr-4">
            <div className="grid size-8 place-items-center rounded-full bg-[#e0ee56] text-xs font-black text-[#14212b]">
              {adminName[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-left">
              <p className="text-xs font-black leading-none">{adminName}</p>
              <p className="text-[10px] text-[#14212b]/60 leading-tight mt-0.5">{adminEmail}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center gap-1.5 border-[#9a4e2c]/30 text-[#9a4e2c] hover:bg-[#9a4e2c] hover:text-[#f5f5f1]"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
