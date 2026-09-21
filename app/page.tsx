'use client';
import { useState, useEffect } from 'react';
import { AdminView, User } from '@/lib/types';
import { getAdminToken, clearAdminAuth, getAdminUser, saveAdminAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';
import { UsersManager } from '@/components/UsersManager';
import { CategoriesManager } from '@/components/CategoriesManager';
import { ProductsManager } from '@/components/ProductsManager';
import { OrdersManager } from '@/components/OrdersManager';
import { PaymentsManager } from '@/components/PaymentsManager';
import { SubscribersManager } from '@/components/SubscribersManager';

export default function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState<AdminView>('dashboard');
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    function handleUnauthorized() {
      clearAdminAuth();
      setLoggedIn(false);
      setCurrentUser(null);
      setCheckingAuth(false);
    }

    window.addEventListener('shopit_admin_unauthorized', handleUnauthorized);

    const token = getAdminToken();
    if (!token) {
      setLoggedIn(false);
      setCheckingAuth(false);
      return () => {
        window.removeEventListener('shopit_admin_unauthorized', handleUnauthorized);
      };
    }

    // Verify token against profile endpoint
    apiRequest<User>('/api/users/profile.php', 'GET', undefined, token)
      .then((profile) => {
        if (profile && profile.role === 'admin') {
          saveAdminAuth(token, profile);
          setCurrentUser(profile);
          setLoggedIn(true);
        } else {
          clearAdminAuth();
          setLoggedIn(false);
          setCurrentUser(null);
        }
      })
      .catch(() => {
        clearAdminAuth();
        setLoggedIn(false);
        setCurrentUser(null);
      })
      .finally(() => {
        setCheckingAuth(false);
      });

    return () => {
      window.removeEventListener('shopit_admin_unauthorized', handleUnauthorized);
    };
  }, []);

  function notify(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3500);
  }

  function handleLoginSuccess() {
    setLoggedIn(true);
    setCurrentUser(getAdminUser());
    setView('dashboard');
    notify('Welcome to ShopIt Control Room.');
  }

  function handleLogout() {
    clearAdminAuth();
    setLoggedIn(false);
    setCurrentUser(null);
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f5f1] text-[#14212b] flex flex-col items-center justify-center p-6 text-center">
        <div className="grid size-12 place-items-center bg-[#14212b] text-xl font-black text-[#e0ee56] mb-4 animate-pulse">
          S
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9a4e2c]">Verifying Security Credentials...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f1] text-[#14212b] flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
        adminName={currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}` : 'Administrator'}
        adminEmail={currentUser?.email || 'Administrator'}
      />

      {/* Main Admin Body */}
      <div className="flex-1 mx-auto w-full max-w-[1440px] px-3 sm:px-5 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <Sidebar currentView={view} onNavigate={setView} />

          {/* View Content Canvas */}
          <main className="flex-1 min-w-0">
            {view === 'dashboard' && (
              <Dashboard
                onNavigateToProducts={() => setView('products')}
                onNavigateToOrders={() => setView('orders')}
              />
            )}
            {view === 'users' && <UsersManager onNotify={notify} />}
            {view === 'categories' && <CategoriesManager onNotify={notify} />}
            {view === 'products' && <ProductsManager onNotify={notify} />}
            {view === 'orders' && <OrdersManager onNotify={notify} />}
            {view === 'payments' && <PaymentsManager onNotify={notify} />}
            {view === 'subscribers' && <SubscribersManager onNotify={notify} />}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#14212b]/15 bg-[#14212b] px-4 sm:px-5 py-6 text-[#f5f5f1]">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 text-center sm:text-left">
          <span>ShopIt ADMIN CONTROL ROOM · v2.4.0</span>
          <span>Trade & Logistics System Engine</span>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 border border-[#14212b] bg-[#e0ee56] text-[#14212b] px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-[0.14em] shadow-2xl animate-in slide-in-from-bottom-5 duration-200 max-w-[calc(100vw-2rem)]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
