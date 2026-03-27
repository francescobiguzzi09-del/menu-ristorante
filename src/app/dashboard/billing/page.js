"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function BillingPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free'); // 'free' | 'premium'
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      // In futuro: caricare il piano reale da Supabase
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleUpgrade = () => {
    // Simulazione Checkout Stripe Subscriptions
    alert("In futuro questo bottone ti manderà al checkout Stripe per sottoscrivere l'abbonamento Premium e sbloccare tutte le funzionalità.");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento Piani...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans pb-20 flex flex-col transition-colors duration-300">
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Scegli il Piano perfetto per te</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">Sblocca il pieno potenziale del tuo ristorante. Che tu abbia un solo locale o una catena, abbiamo il piano giusto per aiutarti a crescere.</p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          
          {/* FREE PLAN */}
          <div className={`bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 border shadow-xl relative flex flex-col transition-colors ${currentPlan === 'free' ? 'border-amber-400/50 shadow-amber-900/5' : 'border-slate-200 dark:border-slate-800 shadow-slate-900/5'}`}>
            {currentPlan === 'free' && (
               <div className="absolute top-0 right-0 -tr mr-6 -mt-3 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                 Piano Attuale
               </div>
            )}
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Base Gratuito</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">Tutto quello che ti serve per lanciare il primo menù digitale.</p>
            <div className="flex items-end gap-1 mb-8">
               <span className="text-4xl font-black text-slate-900 dark:text-white">€0</span>
               <span className="text-slate-500 text-sm font-medium mb-1">/mese</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-sm text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Fino a 2 Menù Base
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Generazione AI (Fino a 30 piatti)
              </li>
               <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Traduzione Multilingua Standard
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Ricezione Ordini e Pagamenti (Stripe)
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Analytics Visite e Dati
              </li>
            </ul>

            <button 
              disabled={currentPlan === 'free'}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all ${currentPlan === 'free' ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
            >
              {currentPlan === 'free' ? 'Il tuo piano attuale' : 'Passa al Base'}
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-slate-900 rounded-[32px] p-8 sm:p-10 border border-indigo-500/30 shadow-2xl shadow-indigo-900/40 relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
             
             <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-xl font-black text-white flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   Premium Pro
                 </h3>
                 <span className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Consigliato</span>
              </div>
              <p className="text-indigo-200/80 text-sm mb-6 h-10">Rivoluziona il tuo locale e offri ai tuoi clienti ordini istantanei dal tavolo col qrcode.</p>
              <div className="flex items-end gap-1 mb-8">
                 <span className="text-4xl font-black text-white">€29</span>
                 <span className="text-indigo-300 font-medium text-sm mb-1">/mese</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1 text-sm text-indigo-100 font-medium">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Menù Illimitati e Piatti Illimitati
                </li>
                 <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-white font-bold tracking-wide">Accetta Ordini e Pagamenti (Stripe) al tavolo</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Dashboard Analytics (Visite, Conversioni)
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Temi Premium Personalizzati
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Nessun Logo "Powered By"
                </li>
              </ul>

              <button 
                onClick={handleUpgrade}
                className="w-full bg-white text-slate-900 border border-transparent font-black py-4 px-6 rounded-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                Passa a Premium
              </button>
             </div>
          </div>

        </div>

        {/* FATTURAZIONE E INVOICES (VISIBLE QUANDO ATTIVO) */}
        {currentPlan === 'premium' && (
           <div className="max-w-4xl mx-auto bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-xl shadow-indigo-900/5 mb-8">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
               Storico Fatturazione
             </h2>
             <div className="text-center py-6">
                <p className="text-slate-500 font-medium">Non ci sono fatture precedenti.</p>
             </div>
           </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
