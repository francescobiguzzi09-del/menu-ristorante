"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';

export default function StripeSettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState('not_connected'); // 'not_connected' | 'active'
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [connectedMenuName, setConnectedMenuName] = useState(null);
  const router = useRouter();
  const toast = useToast();

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
    toast.info("Per collegare Stripe, vai nella pagina di modifica del tuo menù e attiva la 'Funzione Ordina'. Da lì potrai collegare il tuo conto bancario.", 'Come collegare Stripe');
  };

  const handleManageStripe = () => {
    // In futuro: redirect alla Stripe Dashboard Express
    window.open(`https://dashboard.stripe.com`, '_blank');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col transition-colors duration-300">
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
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 border border-rose-200 dark:border-rose-900/50 shadow-xl shadow-rose-900/5 dark:shadow-black/20 mb-8 relative overflow-hidden">
          {/* Overlay pattern for aesthetics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 dark:bg-rose-500/10 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Funzionalità Sospesa Temporaneamente</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Integrazione Pagamenti in Manutenzione
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 max-w-2xl">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Perché i pagamenti sono disabilitati?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Stiamo ultimando un aggiornamento importante al nostro partner di pagamento (Stripe) per rispettare le nuove normative vigenti. L'integrazione che ti permetterà di ricevere i pagamenti direttamente dal menù è momentaneamente sospesa.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                 Questa funzione tornerà presto disponibile. Nel frattempo, puoi usare gratis tutte le altre straordinarie funzionalità premium (Analytics, Multilingua, Template, etc.).
              </p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
