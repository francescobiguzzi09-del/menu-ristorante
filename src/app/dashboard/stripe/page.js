"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function StripeSettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState('not_connected'); // 'not_connected' | 'active'
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [connectedMenuName, setConnectedMenuName] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      // Controlla se l'utente ha almeno un menu con Stripe collegato
      const { data: menus } = await supabase
        .from('menus')
        .select('restaurant_id, data')
        .eq('user_id', session.user.id);

      if (menus && menus.length > 0) {
        const menuWithStripe = menus.find(m => m.data?.settings?.stripeAccountId);
        if (menuWithStripe) {
          setStripeStatus('active');
          setStripeAccountId(menuWithStripe.data.settings.stripeAccountId);
          setConnectedMenuName(menuWithStripe.data.settings.restaurantName || menuWithStripe.restaurant_id);
        }
      }

      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleConnectStripe = async () => {
    alert("Per collegare Stripe, vai nella pagina di modifica del tuo menù e attiva la 'Funzione Ordina'. Da lì potrai collegare il tuo conto bancario tramite Stripe Connect.");
  };

  const handleManageStripe = () => {
    // In futuro: redirect alla Stripe Dashboard Express
    window.open(`https://dashboard.stripe.com`, '_blank');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans pb-20 flex flex-col transition-colors duration-300">
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full">
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Pagamenti e Incassi (Stripe)</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">Collega il tuo conto bancario per iniziare ad accettare pagamenti digitali (Carte di credito, Apple Pay, Google Pay) direttamente dai tuoi menù online senza intermediari.</p>
        </div>

        {/* STATUS CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-900/5 dark:shadow-black/20 mb-8 relative overflow-hidden">
          {/* Overlay pattern for aesthetics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/10 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${stripeStatus === 'not_connected' ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : 'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40'}`}>
                {stripeStatus === 'not_connected' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Stato Account</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${stripeStatus === 'not_connected' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span className={`text-sm font-bold uppercase tracking-wider ${stripeStatus === 'not_connected' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {stripeStatus === 'not_connected' ? 'Non Connesso' : 'Attivo e Verificato'}
                  </span>
                </div>
              </div>
            </div>

            {stripeStatus === 'active' && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 mb-8 max-w-2xl">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Conto collegato con successo!
                </h4>
                <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300/80">
                  <p><span className="font-bold">Menù:</span> {connectedMenuName}</p>
                  <p><span className="font-bold">Account ID:</span> <code className="bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded text-xs font-mono">{stripeAccountId}</code></p>
                  <p className="pt-1 text-emerald-600 dark:text-emerald-400">I pagamenti dal menu verranno accreditati automaticamente sul tuo conto bancario.</p>
                </div>
              </div>
            )}

            {stripeStatus === 'not_connected' && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 max-w-2xl">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Come funziona?</h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li>Vai nella pagina di modifica del tuo menù.</li>
                  <li>Attiva la <strong>"Funzione Ordina"</strong> nella sezione Setup Ristorante.</li>
                  <li>Clicca su <strong>"Collega Conto per ricevere Pagamenti"</strong> e segui la procedura guidata di Stripe.</li>
                  <li>Torna qui per verificare che lo stato sia <strong className="text-emerald-600">"Attivo"</strong>.</li>
                </ol>
              </div>
            )}

            <div>
              {stripeStatus === 'active' ? (
                <button 
                  onClick={handleManageStripe}
                  className="bg-[#635BFF] hover:bg-[#4E44D6] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#635BFF]/30 transition-all flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Gestisci Conto Stripe
                </button>
              ) : (
                <button 
                  onClick={handleConnectStripe}
                  className="bg-[#635BFF] hover:bg-[#4E44D6] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#635BFF]/30 transition-all flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Come Collegare Stripe
                </button>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Gestito tramite connessione bancaria criptata e sicura di Stripe.
              </p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
