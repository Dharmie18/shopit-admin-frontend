'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { money } from '@/lib/utils';
import {
  ClipboardList,
  Eye,
  Search,
} from 'lucide-react';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

export function OrdersManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await apiRequest('/api/admin/orders.php');
      const loadedOrders = Array.isArray(data) ? data : [];
      loadedOrders.sort((a, b) => Number(b.order_id) - Number(a.order_id));
      setOrders(loadedOrders);
    } catch (err: any) {
      onNotify('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string | number, newStatus: OrderStatus) {
    try {
      await apiRequest('/api/admin/orders.php/' + orderId, 'PUT', { order_status: newStatus });
      onNotify('Order ' + orderId + ' status updated to ' + newStatus);
      setOrders((curr) =>
        curr.map((o) => (String(o.order_id) === String(orderId) ? { ...o, order_status: newStatus } : o))
      );
    } catch (err: any) {
      onNotify('Failed to update order status: ' + err.message);
    }
  }

  function getStatusBadge(status: OrderStatus) {
    switch (status) {
      case 'Delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'Shipped':
        return <Badge variant="info">Shipped</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  }

  const filteredOrders = orders.filter((o) =>
    (String(o.order_id) + ' ' + (o.shipping_address || '') + ' ' + o.order_status + ' ' + (o.customer_name || ''))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Fulfillment Queue
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Order Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-[#14212b]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full sm:w-64 border border-[#14212b]/20 bg-[#f5f5f1] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#9a4e2c]"
            />
          </div>
        </div>
      </div>

      <div className="border border-[#14212b]/15 bg-[#f5f5f1]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#e8e8e1] text-[10px] font-black uppercase tracking-[0.14em] text-[#14212b]/60 border-b border-[#14212b]/15">
              <tr>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Invoice Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Quick Update</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-8 w-24" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#14212b]/60">
                    No orders matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-[#e8e8e1]/40">
                    <td className="p-4 font-black">#{order.order_id}</td>
                    <td className="p-4 font-bold text-xs">
                      {order.customer_name || ('User #' + order.user_id)}
                    </td>
                    <td className="p-4 text-xs text-[#14212b]/60">{order.order_date}</td>
                    <td className="p-4 text-xs text-[#14212b]/70 truncate max-w-xs">
                      {order.shipping_address}
                    </td>
                    <td className="p-4 font-black text-sm">{money(order.total_amount)}</td>
                    <td className="p-4">{getStatusBadge(order.order_status)}</td>
                    <td className="p-4">
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateOrderStatus(order.order_id, e.target.value as OrderStatus)
                        }
                        className="border border-[#14212b]/25 bg-[#f5f5f1] px-2.5 py-1 text-xs font-bold outline-none focus:border-[#9a4e2c]"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="size-3" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={'Order Details: #' + selectedOrder?.order_id}
        subtitle="Fulfillment Inspection"
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Order Date</span>
                <p className="font-bold mt-1">{selectedOrder.order_date}</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Invoice Total</span>
                <p className="font-bold text-sm mt-1">{money(selectedOrder.total_amount)}</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Customer</span>
                <p className="font-bold mt-1">{selectedOrder.customer_name || ('User #' + selectedOrder.user_id)}</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Current Status</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.order_status)}</div>
              </div>
            </div>

            <div className="border border-[#14212b]/15 bg-[#f5f5f1] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a4e2c]">
                Shipping & Freight Address
              </p>
              <p className="mt-2 text-sm font-medium">{selectedOrder.shipping_address}</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#14212b]/15">
              <Button variant="primary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Order View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
