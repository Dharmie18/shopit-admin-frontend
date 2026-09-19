'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Payment, PaymentStatus } from '@/lib/types';
import { money } from '@/lib/utils';
import { CreditCard, Search } from 'lucide-react';
import { Button } from './ui/button';
import { sleep } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Refunded'];

export function PaymentsManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    try {
      const [data] = await Promise.all([apiRequest('/api/admin/payments.php'), sleep(600)]);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify('Failed to fetch payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePaymentStatus(paymentId: number, newStatus: PaymentStatus) {
    try {
      await apiRequest('/api/admin/payments.php/' + paymentId, 'PUT', { payment_status: newStatus });
      onNotify('Payment #' + paymentId + ' marked as ' + newStatus);
      setPayments((curr) =>
        curr.map((p) => (p.payment_id === paymentId ? { ...p, payment_status: newStatus } : p))
      );
    } catch (err: any) {
      onNotify('Failed to update payment status: ' + err.message);
    }
  }

  function getStatusBadge(status: PaymentStatus) {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'Refunded':
        return <Badge variant="warning">Refunded</Badge>;
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  }

  const filteredPayments = payments.filter((p) =>
    (String(p.payment_id) + ' ' + String(p.order_id) + ' ' + p.payment_method + ' ' + p.payment_status + ' ' + (p.customer_name || ''))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Financial Settlement
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Payment Oversight
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-[#14212b]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments..."
              className="w-full sm:w-64 border border-[#14212b]/20 bg-[#f5f5f1] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#9a4e2c]"
            />
          </div>
        </div>
      </div>

      <div className="border border-[#14212b]/15 bg-[#f5f5f1]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-[#e8e8e1] text-[10px] font-black uppercase tracking-[0.14em] text-[#14212b]/60 border-b border-[#14212b]/15">
              <tr>
                <th className="p-4">Tx ID</th>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Gateway / Method</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#14212b]/60">
                    No payment records matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.payment_id} className="hover:bg-[#e8e8e1]/40">
                    <td className="p-4 font-mono font-bold text-xs text-[#14212b]/60">
                      #{pay.payment_id}
                    </td>
                    <td className="p-4 font-black">#{pay.order_id}</td>
                    <td className="p-4 text-xs font-bold">{pay.customer_name || 'Wholesale Client'}</td>
                    <td className="p-4 text-xs font-bold text-[#14212b]/70">
                      {pay.payment_method}
                    </td>
                    <td className="p-4 text-xs text-[#14212b]/60">{pay.payment_date}</td>
                    <td className="p-4 font-black text-sm">{money(pay.amount)}</td>
                    <td className="p-4">{getStatusBadge(pay.payment_status)}</td>
                    <td className="p-4 text-right">
                      <select
                        value={pay.payment_status}
                        onChange={(e) =>
                          updatePaymentStatus(pay.payment_id, e.target.value as PaymentStatus)
                        }
                        className="border border-[#14212b]/25 bg-[#f5f5f1] px-2.5 py-1 text-xs font-bold outline-none focus:border-[#9a4e2c]"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
