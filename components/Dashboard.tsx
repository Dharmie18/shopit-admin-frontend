'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { LowStockReport, TopCustomerReport, MonthlySalesReport } from '@/lib/types';
import { cn, money, sleep } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface DashboardProps {
  onNavigateToProducts: () => void;
  onNavigateToOrders: () => void;
}

export function Dashboard({ onNavigateToProducts, onNavigateToOrders }: DashboardProps) {
  const [lowStock, setLowStock] = useState<LowStockReport[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerReport[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [openedAt, setOpenedAt] = useState<Date | null>(null);

  useEffect(() => {
    setOpenedAt(new Date());
    async function loadReports() {
      setLoading(true);
      try {
        const [lowStockData, topCustData, salesData] = await Promise.all([
          apiRequest('/api/admin/reports.php/low-stock'),
          apiRequest('/api/admin/reports.php/top-customers'),
          apiRequest('/api/admin/reports.php/monthly-sales'),
          sleep(700),
        ]);
        setLowStock(Array.isArray(lowStockData) ? lowStockData : []);
        setTopCustomers(Array.isArray(topCustData) ? topCustData : []);
        setMonthlySales(Array.isArray(salesData) ? salesData : []);
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const totalMonthlyRev = monthlySales.reduce((acc, curr) => acc + (Number(curr.total_sales) || 0), 0);
  const maxSale = Math.max(...monthlySales.map((s) => Number(s.total_sales)), 1);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Internal / ShopIt Ops
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Executive Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">Live Production</Badge>
          <span className="text-xs font-bold text-[#14212b]/60">
            {openedAt
              ? openedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Updating...'}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="size-4" />
                </div>
                <Skeleton className="mt-4 h-8 w-32" />
                <Skeleton className="mt-2 h-3 w-40" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
              <div className="flex items-center justify-between text-[#14212b]/60">
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">Gross Settled Sales</span>
                <DollarSign className="size-4 text-[#9a4e2c]" />
              </div>
              <div className="mt-3 text-3xl font-black tracking-[-0.06em]">
                {money(totalMonthlyRev)}
              </div>
              <p className="mt-1 text-xs font-bold text-[#9a4e2c]">
                Live aggregate across orders
              </p>
            </div>

            <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
              <div className="flex items-center justify-between text-[#14212b]/60">
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">Monthly Momentum</span>
                <TrendingUp className="size-4 text-emerald-600" />
              </div>
              <div className="mt-3 text-3xl font-black tracking-[-0.06em]">
                {monthlySales[0] ? money(monthlySales[0].total_sales) : '₦0.00'}
              </div>
              <p className="mt-1 text-xs font-bold text-emerald-700">
                Current cycle invoice volume
              </p>
            </div>

            <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
              <div className="flex items-center justify-between text-[#14212b]/60">
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">Top Wholesale Accounts</span>
                <Users className="size-4 text-[#14212b]/60" />
              </div>
              <div className="mt-3 text-3xl font-black tracking-[-0.06em]">
                {topCustomers.length} Verified
              </div>
              <p className="mt-1 text-xs text-[#14212b]/60">
                Leading repeat buyers
              </p>
            </div>

            <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
              <div className="flex items-center justify-between text-[#14212b]/60">
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">Low Stock Alert</span>
                <AlertTriangle className="size-4 text-[#9a4e2c]" />
              </div>
              <div className="mt-3 text-3xl font-black tracking-[-0.06em] text-[#9a4e2c]">
                {lowStock.length} SKUs
              </div>
              <p className="mt-1 text-xs font-bold text-[#9a4e2c]">
                Stock quantity &lt; 10 units
              </p>
            </div>
          </>
        )}
      </div>

      {/* Middle Grid: Monthly Sales Chart & Low Stock Alert Widget */}
      <div className="grid gap-8 xl:grid-cols-[1.2fr_.8fr]">
        {/* Monthly Sales Revenue Pulse Chart */}
        <div className="border border-[#14212b]/15 bg-[#f5f5f1] p-6">
          <div className="flex items-center justify-between border-b border-[#14212b]/15 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a4e2c]">
                Revenue Pulse
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] uppercase">
                Monthly Sales Performance
              </h2>
            </div>
            <BarChart3 className="size-5 text-[#14212b]/50" />
          </div>

          {loading ? (
            <div className="mt-8 flex h-60 items-end gap-3 border-b border-l border-[#14212b]/20 px-2 pb-2">
              {[45, 60, 35, 75, 50, 90, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <Skeleton style={{ height: h + '%' }} className="w-full max-w-10" />
                  <Skeleton className="h-3 w-8 mt-1" />
                </div>
              ))}
            </div>
          ) : monthlySales.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-xs text-[#14212b]/50">
              <BarChart3 className="size-8 text-[#14212b]/20 mb-2" />
              No historical sales data recorded yet.
            </div>
          ) : (
            <div className="mt-8 flex h-60 items-end gap-2 sm:gap-3 border-b border-l border-[#14212b]/20 px-2 pb-2">
              {monthlySales.map((item, idx) => {
                const heightPct = Math.round((Number(item.total_sales) / maxSale) * 100);
                const isCurrent = idx === 0;
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                    <div className="absolute -top-9 z-20 hidden group-hover:block bg-[#14212b] text-[#e0ee56] text-[10px] font-black px-2 py-1 shadow-lg whitespace-nowrap">
                      {item.month}: {money(item.total_sales)}
                    </div>

                    <div
                      style={{ height: heightPct + '%' }}
                      className={cn(
                        'w-full max-w-10 transition-all duration-300 group-hover:opacity-80',
                        isCurrent ? 'bg-[#9a4e2c]' : 'bg-[#14212b]'
                      )}
                    />
                    <span className="text-[9px] font-bold text-[#14212b]/60 rotate-45 sm:rotate-0 mt-1">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-between text-xs text-[#14212b]/60">
            <span>Chart indicates gross invoices settled per calendar month.</span>
            <span className="font-bold text-[#14212b]">Peak: {money(maxSale)}</span>
          </div>
        </div>

        {/* Low Stock Warning Widget */}
        <div className="border border-[#14212b]/15 bg-[#f5f5f1] flex flex-col justify-between">
          <div>
            <div className="border-b border-[#14212b]/15 p-6 bg-[#e8e8e1]/60 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a4e2c]">
                  Inventory Risk
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] uppercase">
                  Low Stock Items
                </h2>
              </div>
              <Badge variant="warning">{lowStock.length} Warning</Badge>
            </div>

            <div className="divide-y divide-[#14212b]/10">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : lowStock.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#14212b]/50">
                  <CheckCircle className="size-6 text-emerald-600 mx-auto mb-2" />
                  All inventory healthy. No SKUs below minimum threshold.
                </div>
              ) : (
                lowStock.map((prod) => (
                  <div key={prod.product_id} className="flex items-center justify-between p-4 hover:bg-[#e8e8e1]/40">
                    <div>
                      <p className="font-black text-sm">{prod.product_name}</p>
                      <p className="text-xs text-[#14212b]/55 mt-0.5">
                        {prod.category_name || 'General SKU'} · Unit price: {money(prod.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-[#f2cf96] text-[#6b4712] px-2.5 py-1 text-xs font-black uppercase">
                        {prod.stock_quantity} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-[#14212b]/15 bg-[#e8e8e1]/30">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToProducts}
              className="w-full flex items-center justify-center gap-2"
            >
              Open Catalog & Restock <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top 5 Customers Leaderboard */}
      <div className="border border-[#14212b]/15 bg-[#f5f5f1]">
        <div className="border-b border-[#14212b]/15 p-6 bg-[#e8e8e1]/60 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a4e2c]">
              Account Intelligence
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] uppercase">
              Top 5 B2B Customer Leaderboard
            </h2>
          </div>
          <span className="text-xs text-[#14212b]/60">Ranked by Lifetime Volume</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#e8e8e1] text-[10px] font-black uppercase tracking-[0.14em] text-[#14212b]/60 border-b border-[#14212b]/15">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Lifetime Gross Spend</th>
                <th className="p-4">Account Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-6" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                    </tr>
                  ))}
                </>
              ) : topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-[#14212b]/50">
                    No customer orders recorded yet.
                  </td>
                </tr>
              ) : (
                topCustomers.map((cust, idx) => (
                  <tr key={cust.user_id} className="hover:bg-[#e8e8e1]/40">
                    <td className="p-4 font-black text-xs text-[#14212b]/50">
                      #{idx + 1}
                    </td>
                    <td className="p-4 font-black">
                      {cust.first_name} {cust.last_name}
                    </td>
                    <td className="p-4 text-xs font-bold text-[#14212b]/70">
                      {cust.orders_placed} wholesale orders
                    </td>
                    <td className="p-4 font-black text-sm text-[#14212b]">
                      {money(cust.lifetime_value)}
                    </td>
                    <td className="p-4">
                      <Badge variant={idx === 0 ? 'info' : idx < 3 ? 'warning' : 'default'}>
                        {idx === 0 ? 'Tier 1 Diamond' : idx < 3 ? 'Tier 2 Gold' : 'Tier 3 Trade'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
