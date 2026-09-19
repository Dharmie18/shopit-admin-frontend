'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { NewsletterSubscriber } from '@/lib/types';
import { sleep } from '@/lib/utils';
import {
  Mail,
  Trash2,
  Search,
  CheckCircle2,
  Users,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Modal } from './ui/modal';

export function SubscribersManager({ onNotify }: { onNotify: (msg: string) => void }) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const [data] = await Promise.all([
        apiRequest('/api/admin/subscribers.php'),
        sleep(600),
      ]);
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify('Failed to fetch subscribers: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeleteSubscriber() {
    if (!subscriberToDelete) return;
    setActionLoading(true);
    try {
      await apiRequest('/api/admin/subscribers.php/' + subscriberToDelete.subscriber_id, 'DELETE');
      onNotify('Subscriber removed successfully.');
      setSubscriberToDelete(null);
      loadSubscribers();
    } catch (err: any) {
      onNotify('Failed to remove subscriber: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#14212b]/15 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a4e2c]">
            Audience & Growth Operations
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-black uppercase tracking-[-0.08em]">
            Newsletter Subscribers
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-[#14212b]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              className="w-full sm:w-64 border border-[#14212b]/20 bg-[#f5f5f1] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#9a4e2c]"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadSubscribers}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={'size-3.5 ' + (loading ? 'animate-spin' : '')} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
          <div className="flex items-center justify-between text-[#14212b]/60">
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Total Audience</span>
            <Users className="size-4 text-[#9a4e2c]" />
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight">
            {loading ? <Skeleton className="h-8 w-16" /> : subscribers.length}
          </div>
          <p className="mt-1 text-xs text-[#14212b]/60">Registered B2B dispatch emails</p>
        </div>

        <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
          <div className="flex items-center justify-between text-[#14212b]/60">
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Active Status</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-emerald-700">
            {loading ? <Skeleton className="h-8 w-16" /> : subscribers.filter(s => s.status === 'active').length}
          </div>
          <p className="mt-1 text-xs text-emerald-700 font-bold">100% Verified delivery rate</p>
        </div>

        <div className="border border-[#14212b]/15 bg-[#e8e8e1] p-5">
          <div className="flex items-center justify-between text-[#14212b]/60">
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Broadcast Channel</span>
            <Mail className="size-4 text-[#14212b]/60" />
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight">
            Weekly Digest
          </div>
          <p className="mt-1 text-xs text-[#14212b]/60">Direct supply-chain briefs</p>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="border border-[#14212b]/15 bg-[#f5f5f1]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#e8e8e1] text-[10px] font-black uppercase tracking-[0.14em] text-[#14212b]/60 border-b border-[#14212b]/15">
              <tr>
                <th className="p-4">Subscriber ID</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Subscribed</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14212b]/10">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-52" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-7 w-16 ml-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-[#14212b]/60">
                    <Mail className="size-8 mx-auto mb-2 text-[#14212b]/30" />
                    No subscribers found matching "{search}".
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.subscriber_id} className="hover:bg-[#e8e8e1]/40">
                    <td className="p-4 font-bold text-xs text-[#14212b]/60">
                      #{sub.subscriber_id}
                    </td>
                    <td className="p-4 font-mono font-bold text-xs sm:text-sm">
                      {sub.email}
                    </td>
                    <td className="p-4">
                      <Badge variant={sub.status === 'active' ? 'info' : 'warning'}>
                        {sub.status || 'active'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-[#14212b]/65">
                      {sub.subscribed_at || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setSubscriberToDelete(sub)}
                        className="flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="size-3" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!subscriberToDelete}
        onClose={() => setSubscriberToDelete(null)}
        title="Remove Subscriber"
        subtitle="Audience List Management"
        maxWidth="sm"
      >
        {subscriberToDelete && (
          <div className="flex flex-col gap-5">
            <p className="text-xs leading-relaxed">
              Are you sure you want to remove <strong>{subscriberToDelete.email}</strong> from the ShopIt newsletter dispatch list?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSubscriberToDelete(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDeleteSubscriber}
                disabled={actionLoading}
              >
                {actionLoading ? 'Removing...' : 'Confirm Remove'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
