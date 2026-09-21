'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { User } from '@/lib/types';
import {
  Users,
  Trash2,
  Eye,
  AlertTriangle,
  Search,
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Button } from './ui/button';
import { sleep, formatNaira } from '@/lib/utils';
import { Modal } from './ui/modal';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface UserOrderHistory {
  user: User;
  lifetime_spend: number;
  total_orders: number;
  orders: Array<{
    order_id: number;
    order_date: string;
    total_amount: number;
    order_status: string;
    shipping_address: string;
    payment_method?: string;
    payment_status?: string;
    items?: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
    }>;
  }>;
}

export function UsersManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // User Order History Inspection State
  const [orderHistoryData, setOrderHistoryData] = useState<UserOrderHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const [data] = await Promise.all([apiRequest('/api/admin/users.php'), sleep(600)]);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewUser(id: number) {
    try {
      const user = await apiRequest('/api/admin/users.php/' + id);
      setSelectedUser(user);
    } catch (err: any) {
      onNotify('Failed to fetch user details');
    }
  }

  async function handleViewOrderHistory(user: User) {
    setHistoryLoading(true);
    setIsHistoryModalOpen(true);
    try {
      const [data] = await Promise.all([
        apiRequest<UserOrderHistory>(`/api/admin/user-orders.php?user_id=${user.user_id}`),
        sleep(400),
      ]);
      setOrderHistoryData(data);
    } catch (err: any) {
      onNotify('Failed to load user order history: ' + err.message);
      setIsHistoryModalOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function confirmDeleteUser() {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await apiRequest('/api/admin/users.php/' + userToDelete.user_id, 'DELETE');
      onNotify('User ' + userToDelete.first_name + ' ' + userToDelete.last_name + ' deleted successfully.');
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      onNotify('Failed to delete user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredUsers = users.filter((u) =>
    (u.first_name + ' ' + u.last_name + ' ' + u.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Administrative Controls
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            User Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-[#14212b]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
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
                <th className="p-4">User ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Referral Info</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-44" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#14212b]/60">
                    No users found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-[#e8e8e1]/40 transition-colors">
                    <td className="p-4 font-bold text-xs text-[#14212b]/60">
                      #{user.user_id}
                    </td>
                    <td className="p-4 font-black">
                      <button
                        onClick={() => handleViewOrderHistory(user)}
                        className="text-left font-black hover:text-[#9a4e2c] hover:underline"
                        title="Click to view full order history"
                      >
                        {user.first_name} {user.last_name}
                      </button>
                    </td>
                    <td className="p-4 text-xs font-mono text-[#14212b]/70">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                        {user.role || 'customer'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#14212b] bg-[#e8e8e1] px-1.5 py-0.5 rounded text-[11px]">
                            {user.referral_code || '—'}
                          </span>
                          {user.referrals_count ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                              {user.referrals_count} ref{user.referrals_count > 1 ? 's' : ''}
                            </span>
                          ) : null}
                        </div>
                        {user.referred_by_name ? (
                          <span className="text-[10px] text-[#9a4e2c] font-medium">
                            Referred by {user.referred_by_name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#14212b]/40">Direct Signup</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[#14212b]/60">
                      {user.created_at || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewOrderHistory(user)}
                          className="flex items-center gap-1 font-bold text-xs"
                        >
                          <ShoppingBag className="size-3 text-[#9a4e2c]" /> Orders
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewUser(user.user_id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="size-3" /> Profile
                        </Button>
                        {user.role !== 'admin' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setUserToDelete(user)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="size-3" /> Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Order History Inspection Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setOrderHistoryData(null);
        }}
        title="Customer Order History"
        subtitle="Full Lifetime Trade & Wholesale Purchases"
        maxWidth="lg"
      >
        {historyLoading ? (
          <div className="flex flex-col gap-4 py-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : orderHistoryData ? (
          <div className="flex flex-col gap-6">
            {/* Header User Card & Spend Stat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#14212b]/15 pb-4">
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-[#14212b] text-base font-black text-[#e0ee56]">
                  {orderHistoryData.user.first_name[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-black">
                    {orderHistoryData.user.first_name} {orderHistoryData.user.last_name}
                  </h4>
                  <p className="text-xs text-[#14212b]/60 font-mono">{orderHistoryData.user.email}</p>
                </div>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#14212b]/50">Lifetime Volume</span>
                <p className="text-lg font-black text-[#9a4e2c]">{formatNaira(orderHistoryData.lifetime_spend)}</p>
                <span className="text-[10px] text-[#14212b]/60 font-mono">{orderHistoryData.total_orders} total orders</span>
              </div>
            </div>

            {/* Orders List */}
            <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {orderHistoryData.orders.length === 0 ? (
                <div className="border border-dashed border-[#14212b]/20 p-8 text-center text-xs text-[#14212b]/60">
                  This user has not placed any orders yet.
                </div>
              ) : (
                orderHistoryData.orders.map((ord) => {
                  const statusVariant = 
                    ord.order_status === 'Delivered' ? 'success' :
                    ord.order_status === 'Shipped' ? 'info' :
                    ord.order_status === 'Cancelled' ? 'danger' : 'warning';

                  return (
                    <div key={ord.order_id} className="border border-[#14212b]/15 bg-white p-4 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#14212b]/10 pb-2">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-[#9a4e2c]" />
                          <span className="font-mono font-bold text-sm">Order #{ord.order_id}</span>
                          <span className="text-xs text-[#14212b]/50">•</span>
                          <span className="text-xs text-[#14212b]/60 flex items-center gap-1 font-mono">
                            <Calendar className="size-3" /> {ord.order_date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant}>{ord.order_status}</Badge>
                          <span className="font-black text-sm text-[#14212b]">{formatNaira(ord.total_amount)}</span>
                        </div>
                      </div>

                      {/* Address & Payment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#14212b]/80 bg-[#f5f5f1] p-2.5">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="size-3.5 text-[#9a4e2c] shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight font-medium">{ord.shipping_address || 'Standard Address'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="size-3.5 text-[#14212b]/50 shrink-0" />
                          <span className="text-[11px] font-mono">
                            {ord.payment_method || 'Bank Transfer'} ({ord.payment_status || 'Paid'})
                          </span>
                        </div>
                      </div>

                      {/* Items Purchased */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="mt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#14212b]/50 mb-1.5">Items Ordered</p>
                          <div className="divide-y divide-[#14212b]/5 border border-[#14212b]/10 text-xs">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="p-2 flex items-center justify-between gap-2 hover:bg-[#f5f5f1]/50">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] font-bold text-[#9a4e2c]">x{it.quantity}</span>
                                  <span className="font-medium text-[#14212b]">{it.product_name}</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-[#14212b]">
                                  {formatNaira(it.unit_price * it.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#14212b]/15">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setOrderHistoryData(null);
                }}
              >
                Close History
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Account Details"
        subtitle="Wholesale Account Profile"
      >
        {selectedUser && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-[#14212b]/15 pb-4">
              <div className="grid size-12 place-items-center rounded-full bg-[#e0ee56] text-base font-black text-[#14212b]">
                {selectedUser.first_name[0]?.toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-black">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h4>
                <p className="text-xs text-[#14212b]/60 font-mono">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Account ID</span>
                <p className="font-mono font-bold mt-1">#{selectedUser.user_id}</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">System Role</span>
                <p className="font-bold mt-1 uppercase">{selectedUser.role || 'customer'}</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Referral Code</span>
                <p className="font-mono font-bold mt-1 text-[#9a4e2c]">{selectedUser.referral_code || 'None'}</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Referred By</span>
                <p className="font-bold mt-1">
                  {selectedUser.referred_by_name ? (
                    <span className="text-emerald-700">{selectedUser.referred_by_name} ({selectedUser.referred_by_code})</span>
                  ) : (
                    <span className="text-[#14212b]/50">Direct / Organic</span>
                  )}
                </p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Total Invited Users</span>
                <p className="font-bold mt-1 text-emerald-800">{selectedUser.referrals_count || 0} Registered Referrals</p>
              </div>
              <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-3">
                <span className="text-[10px] font-bold uppercase text-[#14212b]/50">Created Date</span>
                <p className="font-bold mt-1">{selectedUser.created_at || '—'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#14212b]/15">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const u = selectedUser;
                  setSelectedUser(null);
                  handleViewOrderHistory(u);
                }}
                className="flex items-center gap-1 font-bold text-xs"
              >
                <ShoppingBag className="size-3 text-[#9a4e2c]" /> View Orders
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedUser(null)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirm User Deletion"
        subtitle="Destructive Action"
        maxWidth="sm"
      >
        {userToDelete && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 bg-[#fee2e2] border border-[#991b1b]/20 p-4 text-xs text-[#991b1b]">
              <AlertTriangle className="size-5 shrink-0" />
              <div>
                <p className="font-black uppercase tracking-wider">Warning: Irreversible</p>
                <p className="mt-1 leading-relaxed">
                  Are you sure you want to delete user{' '}
                  <strong>
                    {userToDelete.first_name} {userToDelete.last_name}
                  </strong>{' '}
                  ({userToDelete.email})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setUserToDelete(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDeleteUser}
                loading={actionLoading}
                loadingText="Deleting..."
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

