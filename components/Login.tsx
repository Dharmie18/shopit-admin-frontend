'use client';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { saveAdminAuth, clearAdminAuth } from '@/lib/auth';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { User } from '@/lib/types';

interface LoginProps {
  onSuccess: () => void;
  sessionExpiredMsg?: string;
}

export function Login({ onSuccess, sessionExpiredMsg }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with credentials
      const loginRes = await apiRequest('/api/users/login.php', 'POST', { email, password });
      const token = loginRes.token;

      if (!token) {
        throw new Error('Login failed: Token not provided by server.');
      }

      // 2. Fetch profile using token to verify admin role
      const profile = await apiRequest<User>('/api/users/profile.php', 'GET', undefined, token);

      if (profile.role !== 'admin') {
        clearAdminAuth();
        throw new Error('Unauthorized: This account does not have administrator privileges.');
      }

      // 3. Save admin session (sessionStorage for tab-close auto-logout)
      saveAdminAuth(token, profile);
      onSuccess();
    } catch (err: any) {
      clearAdminAuth();
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f1] text-[#14212b] flex flex-col justify-between">
      <div className="bg-[#14212b] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e0ee56]">
        <div className="mx-auto flex max-w-[1440px] justify-between">
          <span>ShopIt Admin Portal · Restricted System Area</span>
          <span>Role Guard: Admin Only · Auto-Closes on Inactivity</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-12 bg-[#14212b] text-xl font-black text-[#e0ee56] mb-4 shadow-md">
              S
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a4e2c]">
              Authorized Personnel Only
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.07em]">
              Admin Sign In
            </h1>
            <p className="mt-2 text-xs text-[#14212b]/60 max-w-xs mx-auto">
              Administrator credentials required. System verifies role status via token before granting dashboard access.
            </p>
          </div>

          <div className="border border-[#14212b]/20 bg-[#e8e8e1] p-8 shadow-xl">
            {sessionExpiredMsg && !error && (
              <div className="mb-6 flex items-start gap-3 border border-[#9a4e2c]/30 bg-[#fef3c7] p-4 text-xs text-[#92400e]">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Session Notice</p>
                  <p className="mt-0.5">{sessionExpiredMsg}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 border border-[#9a4e2c]/30 bg-[#fee2e2] p-4 text-xs text-[#991b1b]">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Access Denied</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your administrator email"
                  className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-3 text-sm outline-none focus:border-[#9a4e2c]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#14212b]/75 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-[#14212b]/25 bg-[#f5f5f1] px-4 py-3 pr-11 text-sm outline-none focus:border-[#9a4e2c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#14212b]/60 hover:text-[#14212b]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                loadingText="Verifying Admin Role..."
                className="mt-2 w-full py-4 text-xs font-black uppercase tracking-[0.16em]"
              >
                Sign In to Console
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#14212b]/15 bg-[#14212b] px-5 py-6 text-[#f5f5f1] text-center text-xs text-white/50">
        SHOP IT · Internal Control Room & Inventory Engine
      </footer>
    </div>
  );
}
