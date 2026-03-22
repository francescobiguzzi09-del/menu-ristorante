"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import ReviewsPanel from '@/components/ReviewsPanel';
import OrdersPanel from '@/components/OrdersPanel';

export default function DashboardPage() {
  const [menus, setMenus] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menus'); // 'menus' | 'analytics' | 'reviews' | 'orders'
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
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

  const deleteMenu = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare definitivamente questo menù?')) return;
    try {
      const res = await fetch(`/api/menu?restaurantId=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMenus(menus.filter(m => m.restaurant_id !== id));
      } else {
        alert("Errore del server: " + data.error);
      }
    } catch (err) {
      alert("Errore di connessione.");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Caricamento Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">I Miei Ristoranti</h1>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors px-3 py-2 rounded-lg hover:bg-rose-50">
            Esci
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* HERO SECTION */}
        <div className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[32px] p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl shadow-indigo-900/10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-indigo-300 font-bold tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                Pannello di Controllo
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Benvenuto, {user?.email?.split('@')[0]}</h2>
              <p className="text-indigo-100/70 max-w-md leading-relaxed text-sm">Ecco la tua cabina di regia. Crea, modifica e pubblica i menù digitali dei tuoi ristoranti in pochi secondi.</p>
            </div>
            
            <button 
              onClick={createNewMenu}
              className="bg-white hover:bg-indigo-50 text-indigo-900 font-black py-4 px-8 rounded-2xl transition-all shadow-xl flex items-center gap-2 shrink-0 group border border-indigo-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Crea Nuovo Menù
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-6 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('menus')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative ${activeTab === 'menus' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            I Miei Menù
            {activeTab === 'menus' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative flex items-center gap-1.5 ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Analytics <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Premium</span>
            {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative flex items-center gap-1.5 ${activeTab === 'reviews' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Recensioni <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Premium</span>
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`pb-4 font-bold text-sm px-2 transition-colors relative flex items-center gap-1.5 ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Ordini <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Premium</span>
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
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 hide-scrollbar">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-w-[200px] flex-1">
             <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ristoranti Attivi</p>
             <p className="text-3xl font-black text-slate-800 tracking-tight">{menus.length}</p>
           </div>
           
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-w-[200px] flex-1">
             <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Piatti Pubblicati</p>
             <p className="text-3xl font-black text-slate-800 tracking-tight">{menus.reduce((acc, menu) => acc + (menu.data?.menu?.length || 0), 0)}</p>
           </div>
        </div>

        {/* LISTA MENU */}
        {menus.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[32px] p-16 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="w-24 h-24 bg-indigo-50 border border-indigo-100/50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Ancora nessun menù</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">Mostra i tuoi piatti al mondo. Clicca sul bottone per creare la tua prima vetrina digitale con intelligenza artificiale.</p>
            <button onClick={createNewMenu} className="bg-slate-900 hover:bg-black text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-2xl">
              Crea il tuo Primo Menù
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <div key={menu.restaurant_id} className="bg-white border border-slate-200 rounded-[28px] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 hover:-translate-y-1 transition-all flex flex-col group cursor-pointer" onClick={() => router.push(`/admin?id=${menu.restaurant_id}`)}>
                
                {/* Immagine/Cover Card */}
                <div className="h-36 bg-gradient-to-br from-indigo-50 to-slate-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
                  <div className="absolute inset-0 bg-slate-200 opacity-[0.15] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  {menu.data?.settings?.restaurantName ? (
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center font-black text-2xl text-indigo-900 relative z-10 group-hover:scale-110 transition-transform duration-300">
                       {menu.data.settings.restaurantName.substring(0, 2).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                    </div>
                  )}
                  {/* Badge Link Copiato o Status e Tasto Elimina */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className="bg-white/80 backdrop-blur-md text-[10px] font-bold text-slate-500 px-2.5 py-1.5 rounded-lg border border-white/50 shadow-sm flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Attivo
                    </div>
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
                <div className="p-6 flex-1 flex flex-col relative z-20 bg-white">
                  <h3 className="font-bold text-xl text-slate-900 mb-1.5 truncate tracking-tight">{menu.data?.settings?.restaurantName || 'Menù Senza Nome'}</h3>
                  <div className="flex items-center gap-1.5 mb-6 text-xs text-slate-400 font-mono">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                     <span className="truncate">{menu.restaurant_id}</span>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-5">
                    <span className="text-xs font-bold text-slate-500 uppercase bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{menu.data?.menu?.length || 0} Piatti</span>
                    <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 group-hover:text-indigo-700 transition-colors">
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
      </main>
    </div>
  );
}
