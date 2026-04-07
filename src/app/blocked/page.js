"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function BlockedPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [appealSent, setAppealSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (!data || data.status === 'active') {
        router.push('/dashboard');
        return;
      }
      setProfile(data);
      setLoading(false);
    };
    checkStatus();
  }, [router]);

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await supabase.from('appeals').insert({
        user_id: profile.id,
        user_email: profile.email,
        status: profile.status,
        message: message.trim()
      });
      setAppealSent(true);
    } catch (err) {
      toast.error("Errore durante l'invio del reclamo.", 'Errore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Caricamento...</div>;

  const isBanned = profile?.status === 'banned';
  const isSuspended = profile?.status === 'suspended';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-rose-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 relative z-10">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm mx-auto">
          {isBanned ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          )}
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-4">
          {isBanned ? "Account Bannato" : "Account Sospeso"}
        </h1>
        
        <div className="text-center text-slate-600 mb-8 leading-relaxed">
          {isBanned ? (
            <p>Il tuo account è stato permanentemente rimosso dall'amministrazione per violazione dei Termini di Servizio. I tuoi menù non sono più visibili.</p>
          ) : (
            <p>Il tuo account è stato temporaneamente sospeso. Potrai tornare a gestire i tuoi menù a partire dal: 
              <br/><br/>
              <strong className="text-rose-600 text-xl font-black bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 inline-block shadow-sm">
                 {new Date(profile.suspended_until).toLocaleString('it-IT')}
              </strong>
            </p>
          )}
        </div>

        {!appealSent ? (
          <form onSubmit={handleAppealSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-2">Pensi ci sia un errore?</h3>
            <p className="text-sm text-slate-500 mb-4">Puoi inviare un reclamo o una richiesta di chiarimento al nostro team amministrativo.</p>
            <textarea 
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi qui il tuo reclamo..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
              required
            ></textarea>
            <button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Reclamo'}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Reclamo inviato con successo. L'amministrazione lo valuterà a breve.
          </div>
        )}

        <div className="text-center">
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-slate-800 underline underline-offset-4">
            Esci dall'Account
          </button>
        </div>
      </div>
    </div>
  );
}
