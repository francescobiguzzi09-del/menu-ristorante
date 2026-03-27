"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // State for form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      // In futuro: caricare i dati reali dal profilo
      // const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      // if (profile) { setFullName(profile.full_name || ''); setPhone(profile.phone || ''); }
      
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: implementare il salvataggio su database (API o Supabase diretto)
    setTimeout(() => {
      setIsSaving(false);
      alert("Modifiche salvate con successo! (Simulazione)");
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if(confirm("Sei sicuro di voler eliminare definitivamente il tuo account e tutti i menu annessi? Questa operazione è irreversibile.")) {
      alert("Operazione temporaneamente disabilitata per sicurezza.");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento Impostazioni...</div>;

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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Impostazioni Profilo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Aggiorna le tue informazioni personali e gestisci la sicurezza del tuo account.</p>
        </div>

        {/* SETTINGS FORM */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-900/5 dark:shadow-black/20 mb-8 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
            Informazioni Personali
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            {/* Email Field (Disabled typically) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Indirizzo Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-2">L'indirizzo email non può essere modificato per motivi di sicurezza.</p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Es. Mario Rossi"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Numero di Telefono (Opzionale)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 1234567"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Salvataggio...
                  </>
                ) : (
                  <>Salva Modifiche</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-[32px] p-8 sm:p-10 border border-rose-100 dark:border-rose-500/20">
          <h2 className="text-lg font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            Zona Pericolosa
          </h2>
          <p className="text-rose-600/80 dark:text-rose-300/70 mb-6 text-sm">Attenzione: l'eliminazione dell'account rimuoverà tutti i tuoi menù, piatti e lo storico degli ordini definitivamente e in maniera irreversibile.</p>
          <button 
            onClick={handleDeleteAccount}
            className="bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 font-bold py-3 px-6 rounded-xl transition-all shadow-sm"
          >
            Elimina Account Definitivamente
          </button>
        </div>

      </main>
      <Footer />
    </div>
  );
}
