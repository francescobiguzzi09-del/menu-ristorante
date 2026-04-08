"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import ReviewsPanel from '@/components/ReviewsPanel';
import OrdersPanel from '@/components/OrdersPanel';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';

export default function DashboardPage() {
  const [menus, setMenus] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menus'); // 'menus' | 'analytics' | 'reviews' | 'orders'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      const { data: profile } = await supabase.from('profiles').select('status, suspended_until').eq('id', session.user.id).single();
      if (profile) {
        if (profile.status === 'banned') {
          router.push('/blocked');
          return;
        }
        if (profile.status === 'suspended') {
          if (new Date() < new Date(profile.suspended_until)) {
            router.push('/blocked');
            return;
          } else {
            // Restore automatically if suspension time has passed
            await supabase.from('profiles').update({ status: 'active', suspended_until: null }).eq('id', session.user.id);
          }
        }
      }

      // Fetch user's menus
      const { data, error } = await supabase
        .from('menus')
        .select('restaurant_id, data')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }); // Needs created_at in schema, we'll try without order if it fails
        
      if (!error && data) {
         setMenus(data);
      } else {
         // Fallback incase created_at is missing
         const { data: fallbackData } = await supabase.from('menus').select('restaurant_id, data').eq('user_id', session.user.id);
         if (fallbackData) setMenus(fallbackData);
      }
      
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createNewMenu = () => {
    const newId = 'menu-' + Math.random().toString(36).substr(2, 9);
    router.push(`/admin?id=${newId}`);
  };

  const deleteMenu = (e, id) => {
    e.stopPropagation();
    setMenuToDelete(id);
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    try {
      const res = await fetch(`/api/menu?restaurantId=${menuToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMenus(menus.filter(m => m.restaurant_id !== menuToDelete));
        setMenuToDelete(null);
        toast.success('Menù eliminato con successo.', 'Eliminato');
      } else {
        toast.error('Errore del server: ' + data.error, 'Errore');
        setMenuToDelete(null);
      }
    } catch (err) {
      toast.error('Errore di connessione al server.', 'Errore');
      setMenuToDelete(null);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 flex flex-col">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="/" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
                SmartMenu <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </a>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-none">I Miei Ristoranti</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.email === 'francesco.biguzzi09@gmail.com' && (
              <button 
                onClick={() => router.push('/superadmin')}
                className="text-xs font-black bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-500/30 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:pl-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full transition-colors group"
              >
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 hidden sm:block">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.email}</p>
                  </div>
                  
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <a href="/dashboard/stripe" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      Gestione Pagamenti
                    </a>
                    <a href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Piani e Abbonamenti
                    </a>
                  </div>
                  
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Impostazioni Profilo
                    </a>
                  </div>

                  {/* DARK MODE TOGGLE */}
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                      <span className="flex items-center gap-3">
                        {theme === 'dark' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" x2="12" y1="1" y2="3"/><line x1="12" x2="12" y1="21" y2="23"/><line x1="4.22" x2="5.64" y1="4.22" y2="5.64"/><line x1="18.36" x2="19.78" y1="18.36" y2="19.78"/><line x1="1" x2="3" y1="12" y2="12"/><line x1="21" x2="23" y1="12" y2="12"/><line x1="4.22" x2="5.64" y1="19.78" y2="18.36"/><line x1="18.36" x2="19.78" y1="5.64" y2="4.22"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        )}
                        {theme === 'dark' ? 'Modalità Chiara' : 'Modalità Scura'}
                      </span>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-[18px]' : 'translate-x-0.5'}`}></div>
                      </div>
                    </button>
                  </div>
                  
                  <div className="p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      Esci dall'Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col lg:flex-row gap-8 items-start w-full">
        
        <div className="flex-1 w-full min-w-0">
          {/* HERO SECTION */}
          <div className="relative bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-800 dark:to-indigo-900 rounded-[32px] p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl shadow-indigo-900/10 dark:shadow-indigo-900/30 dark:border dark:border-slate-700/50">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
            <div className="w-full">
              <p className="text-indigo-300 font-bold tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                Pannello di Controllo
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 tracking-tight break-all sm:break-normal">Benvenuto, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</h2>
              <p className="text-indigo-100/70 max-w-md leading-relaxed text-sm">Ecco la tua cabina di regia. Crea, modifica e pubblica i menù digitali dei tuoi ristoranti in pochi secondi.</p>
            </div>
            
            <button 
              onClick={createNewMenu}
              className="w-full md:w-auto justify-center bg-white hover:bg-indigo-50 text-indigo-900 font-black py-4 px-8 rounded-2xl transition-all shadow-xl flex items-center gap-2 shrink-0 group border border-indigo-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Crea Nuovo Menù
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 sm:gap-6 mb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto hide-scrollbar flex-nowrap w-full">
          <button 
            onClick={() => setActiveTab('menus')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative whitespace-nowrap shrink-0 ${activeTab === 'menus' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            I Miei Menù
            {activeTab === 'menus' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'analytics' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Analytics <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Beta Free</span>
            {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'reviews' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Recensioni <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Beta Free</span>
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'orders' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Ordini <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Beta Free</span>
            {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <AnalyticsPanel menus={menus} />
        ) : activeTab === 'reviews' ? (
          <ReviewsPanel menus={menus} />
        ) : activeTab === 'orders' ? (
          <OrdersPanel menus={menus} />
        ) : (
          <>
            {/* STATS */}
        <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 mb-10 w-full">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm min-w-0 sm:min-w-[200px] flex-1 transition-colors">
             <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Menù Attivi</p>
             <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{menus.length}</p>
           </div>
           
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm min-w-0 sm:min-w-[200px] flex-1 transition-colors">
             <div className="w-10 h-10 bg-teal-50 dark:bg-teal-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Piatti Pubblicati</p>
             <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{menus.reduce((acc, menu) => acc + (menu.data?.menu?.length || 0), 0)}</p>
           </div>
        </div>

        {/* LISTA MENU */}
        {menus.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 sm:p-16 text-center shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ancora nessun menù</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">Mostra i tuoi piatti al mondo. Clicca sul bottone per creare la tua prima vetrina digitale con intelligenza artificiale.</p>
            <button onClick={createNewMenu} className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-2xl">
              Crea il tuo Primo Menù
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <div key={menu.restaurant_id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:-translate-y-1 transition-all flex flex-col group cursor-pointer" onClick={() => router.push(`/admin?id=${menu.restaurant_id}`)}>
                
                {/* Immagine/Cover Card */}
                <div className="h-36 bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="absolute inset-0 bg-slate-200 opacity-[0.15] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  {menu.data?.settings?.restaurantName ? (
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-2xl text-indigo-900 dark:text-indigo-300 relative z-10 group-hover:scale-110 transition-transform duration-300">
                       {menu.data.settings.restaurantName.substring(0, 2).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                    </div>
                  )}
                  {/* Tasto Elimina */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button 
                      onClick={(e) => deleteMenu(e, menu.restaurant_id)} 
                      title="Elimina"
                      className="bg-white/80 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 backdrop-blur-md text-slate-400 p-1.5 rounded-lg border border-white/50 shadow-sm transition-all z-20 relative"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </div>
                
                {/* Contenuto Card */}
                <div className="p-6 flex-1 flex flex-col relative z-20 bg-white dark:bg-slate-900">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1.5 truncate tracking-tight">{menu.data?.settings?.restaurantName || 'Menù Senza Nome'}</h3>
                  <div 
                    className="inline-flex items-center gap-1.5 mb-6 text-xs text-slate-400 font-mono hover:text-indigo-500 transition-colors cursor-pointer hover:bg-indigo-50 p-1 -ml-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(menu.restaurant_id);
                      toast.success('ID Ristorante copiato negli appunti!', 'Copiato');
                    }}
                    title="Copia ID"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                     <span className="truncate">{menu.restaurant_id}</span>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">{menu.data?.menu?.length || 0} Piatti</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      Modifica
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
        </div>

        {/* SIDEBAR DESTRA */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {/* BANNER BETA FEEDBACK */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <h3 className="font-black text-xl mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              Aiutaci a Migliorare
            </h3>
            <p className="text-sm text-indigo-100 mb-6 font-medium leading-relaxed">
              Benvenuto nella Beta! Hai accesso a tutti i servizi premium gratuitamente. Inviaci i tuoi feedback via email.
            </p>
            <a href="mailto:info@smartmenu.ai" className="w-full bg-white text-indigo-700 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              Lascia un Feedback
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
            </a>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Link Rapidi
            </h3>
            <div className="space-y-3">
              <a href="/api-docs" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                Documentazione API
              </a>
              <a href="/faq" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-2 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-colors">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </div>
                Supporto e Aiuto
              </a>
              <a href="/dashboard/stripe" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                Impostazioni Stripe
              </a>
            </div>
          </div>

          {/* ADSENSE PLACEHOLDER */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl h-[250px] flex flex-col items-center justify-center text-center p-6 text-slate-400 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
             <p className="font-bold text-sm mb-1 uppercase tracking-wider">Spazio Pubblicitario</p>
             <p className="text-xs">Riservato a Google AdSense o Banner Promozionali.</p>
          </div>
        </aside>
      </main>

      {/* DELETE MODAL */}
      {menuToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Elimina Menù</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Sei sicuro di voler eliminare definitivamente questo menù? L'azione è irreversibile.</p>
            <div className="flex gap-3">
              <button onClick={() => setMenuToDelete(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors">Annulla</button>
              <button onClick={confirmDeleteMenu} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-600/20">Elimina</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
