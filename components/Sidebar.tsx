'use client';
import { AdminView } from '@/lib/types';
import {
  BarChart3,
  Users,
  Layers,
  Package,
  ClipboardList,
  CreditCard,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Analytics Dashboard', icon: BarChart3, badge: 'Live' },
    { id: 'users' as AdminView, label: 'User Management', icon: Users, badge: null },
    { id: 'categories' as AdminView, label: 'Category Management', icon: Layers, badge: null },
    { id: 'products' as AdminView, label: 'Product Management', icon: Package, badge: null },
    { id: 'orders' as AdminView, label: 'Order Management', icon: ClipboardList, badge: null },
    { id: 'payments' as AdminView, label: 'Payment Oversight', icon: CreditCard, badge: null },
    { id: 'subscribers' as AdminView, label: 'Newsletter Subscribers', icon: Mail, badge: 'New' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
      <div className="border border-[#14212b]/15 bg-[#e8e8e1]/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a4e2c]">Navigation</p>
        <h2 className="mt-1 text-lg font-black tracking-[-0.04em] uppercase text-[#14212b]">Control Room</h2>
      </div>

      <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group flex shrink-0 items-center justify-between border border-transparent p-3.5 text-left text-xs font-black uppercase tracking-[0.12em] transition-all cursor-pointer whitespace-nowrap',
                isActive
                  ? 'bg-[#14212b] text-[#e0ee56] shadow-sm'
                  : 'bg-[#f5f5f1] text-[#14212b] hover:bg-[#e8e8e1] border-[#14212b]/10'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('size-4 transition-transform group-hover:scale-110', isActive ? 'text-[#e0ee56]' : 'text-[#14212b]/70')} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="hidden sm:inline-block bg-[#e0ee56] text-[#14212b] px-1.5 py-0.5 text-[9px] font-black rounded-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operations Quick Card */}
      <div className="hidden lg:block mt-6 border border-[#14212b]/15 bg-[#e8e8e1] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a4e2c]">API Status</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-black">Connected & Verified</p>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#14212b]/60">
          Base: <code className="bg-[#14212b]/10 px-1 py-0.5 text-[10px]">localhost/ecommerce-api</code>
        </p>
      </div>
    </aside>
  );
}
