"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // Supabase will automatically pick up the recovery token from the URL hash
    // when the user lands on this page from the email link
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode — the form is ready
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Le password non corrispondono.', 'Errore');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri.', 'Errore');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setDone(true);
      toast.success('Password aggiornata con successo! Verrai reindirizzato...', 'Fatto!');
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err) {
      toast.error(err.message || 'Errore durante l\'aggiornamento.', 'Errore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {done ? 'Password Aggiornata!' : 'Nuova Password'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {done ? 'Sarai reindirizzato alla dashboard tra pochi secondi.' : 'Scegli una nuova password per il tuo account SmartMenu AI.'}
          </p>
        </div>

        {!done && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">NUOVA PASSWORD</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                placeholder="Minimo 6 caratteri"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">CONFERMA PASSWORD</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                placeholder="Ripeti la password"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || newPassword.length < 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl mt-2 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Aggiornamento...
                </>
              ) : 'Aggiorna Password'}
            </button>
          </form>
        )}

        {done && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-slate-500 text-sm">Reindirizzamento in corso...</p>
          </div>
        )}
      </div>
    </div>
  );
}
