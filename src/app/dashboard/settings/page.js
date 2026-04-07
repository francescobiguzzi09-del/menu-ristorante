"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  // State for form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Load saved metadata
      const meta = session.user.user_metadata || {};
      setFullName(meta.full_name || '');
      setPhone(meta.phone_number || '');
      
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone_number: phone.trim(),
        }
      });

      if (error) throw error;

      setSaved(true);
      toast.success('Profilo aggiornato con successo!', 'Salvato');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Errore durante il salvataggio.', 'Errore');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false);
    toast.warning('Operazione temporaneamente disabilitata per sicurezza.', 'Non disponibile');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Caricamento Impostazioni...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col transition-colors duration-300">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        
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
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-900/5 dark:shadow-black/20 mb-8 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
            Informazioni Personali
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            {/* Email Field (Disabled) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Indirizzo Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-xl focus:outline-none shadow-sm cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-2">L&apos;indirizzo email non può essere modificato per motivi di sicurezza.</p>
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
              <p className="text-xs text-slate-400 mt-2">Questo nome verrà visualizzato nel banner della Dashboard al posto della tua email.</p>
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
              <p className="text-xs text-slate-400 mt-2">Utilizzato per eventuale supporto diretto. Non condiviso con terze parti.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className={`font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center gap-2 ${saved ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'}`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Salvataggio...
                  </>
                ) : saved ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvato!
                  </>
                ) : (
                  <>Salva Modifiche</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-[32px] p-6 sm:p-10 border border-rose-100 dark:border-rose-500/20">
          <h2 className="text-lg font-bold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            Zona Pericolosa
          </h2>
          <p className="text-rose-600/80 dark:text-rose-300/70 mb-6 text-sm">Attenzione: l&apos;eliminazione dell&apos;account rimuoverà tutti i tuoi menù, piatti e lo storico degli ordini definitivamente e in maniera irreversibile.</p>
          <button 
            onClick={handleDeleteAccount}
            className="bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 font-bold py-3 px-6 rounded-xl transition-all shadow-sm"
          >
            Elimina Account Definitivamente
          </button>
        </div>

      </main>
      <Footer />

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Elimina Account</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">Sei sicuro di voler eliminare definitivamente il tuo account e tutti i menù annessi? Questa operazione è <strong className="text-rose-500">irreversibile</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors">Annulla</button>
              <button onClick={confirmDeleteAccount} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-500/30">Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
