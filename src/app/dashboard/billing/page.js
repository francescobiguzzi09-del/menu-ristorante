"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';

export default function BillingPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free'); // 'free' | 'premium'
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
      
      // In futuro: caricare il piano reale da Supabase
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleUpgrade = () => {
    // Simulazione Checkout Stripe Subscriptions
    toast.info("In futuro questo bottone ti manderà al checkout Stripe per sottoscrivere l'abbonamento Premium.", 'Prossimamente');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento Piani...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col transition-colors duration-300">
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Stiamo crescendo: per te è tutto Gratis!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">Siamo in fase di Accesso Beta. Come nostro pioniere, ottieni l'accesso a tutte le funzionalità Premium (e future) in forma completamente gratuita. L'unico limite è la tua immaginazione.</p>
        </div>

        {/* BETA ALL-ACCESS CARD */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-slate-900 rounded-[32px] p-8 sm:p-12 border border-indigo-500/30 shadow-2xl shadow-indigo-900/40 relative overflow-hidden flex flex-col">
             <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -ml-20 -mt-20 pointer-events-none"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-500 rounded-full blur-[100px] opacity-20 -mr-20 -mb-20 pointer-events-none"></div>
             
             <div className="relative z-10 flex-1 flex flex-col items-center text-center">
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-lg shadow-emerald-500/20">Piano Attivo</span>
              
              <h3 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Accesso Beta Pioniere
              </h3>
              
              <div className="flex items-end justify-center gap-2 mb-8">
                 <span className="text-5xl font-black text-white">€0</span>
                 <span className="text-indigo-300 font-medium text-lg mb-1 relative"><span className="absolute w-full h-[2px] bg-red-400 top-1/2 -rotate-12"></span>€29/mese</span>
              </div>
              <p className="text-indigo-100/90 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
                Tutto sbloccato. Avrai per sempre a disposizione il massimo della tecnologia generativa per creare menù illimitati, 
                vedere analytics dettagliate, rimuovere il nostro logo e usare l'intelligenza artificiale per traduzioni e copy.
              </p>
              
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-10 text-sm text-indigo-100 font-medium text-left w-full max-w-xl mx-auto">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  Menù e Piatti Illimitati
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  Dashboard Analytics
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  Temi Luxury e Cinematic
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  Nessun Logo "Powered By"
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  Traduzione Automatica (IA)
                </li>
                 <li className="flex items-center gap-3 opacity-50">
                  <span className="w-6 h-6 rounded-full bg-slate-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </span>
                  Ordini via Stripe <span className="text-[10px] ml-1 bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">In Arrivo</span>
                </li>
              </ul>

              <button 
                disabled
                className="bg-white/10 text-white border border-white/20 font-bold py-4 px-8 rounded-xl cursor-default transition-all shadow-md w-full sm:w-auto"
              >
                Hai già tutto sbloccato! Continua così.
              </button>
             </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
