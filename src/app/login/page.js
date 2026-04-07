"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Registrazione completata! Controlla la tua email per confermare l'account, poi esegui l'accesso.", 'Account Creato');
        setIsLogin(true);
        setIsLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Errore durante l\'autenticazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError("Errore con Google: " + err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success('Email di recupero inviata! Controlla la tua casella di posta (anche lo spam).', 'Email Inviata');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err) {
      toast.error(err.message || 'Errore durante l\'invio. Riprova.', 'Errore');
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{isLogin ? 'Bentornato' : 'Crea il tuo Account'}</h1>
          <p className="text-slate-500 text-sm mt-2">
            {isLogin ? 'Accedi per gestire i tuoi menù digitali.' : 'Inizia a creare menù illimitati gratis.'}
          </p>
        </div>

        {error && <div className="bg-rose-50 text-rose-500 text-sm p-3 rounded-lg mb-6 border border-rose-100">{error}</div>}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl mb-6 transition-all flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continua con Google
        </button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Oppure con email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">PASSWORD (Min 6 caratteri)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          )}

          {!isLogin && (
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                Accetto i <a href="/termini" target="_blank" className="font-bold text-indigo-600 underline">termini d'uso</a> e la <a href="/privacy" target="_blank" className="font-bold text-indigo-600 underline">privacy policy</a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || password.length < 6 || (!isLogin && !acceptTerms)}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl mt-4 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Crea Account')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">{isLogin ? "Non hai un account?" : "Hai già un account?"}</span>{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            {isLogin ? "Registrati" : "Accedi"}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href="/admin" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors underline decoration-slate-300 underline-offset-4">
          Continua come Ospite (Senza salvare)
        </a>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForgotPassword(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Recupera Password</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Inserisci la tua email e ti invieremo un link per reimpostare la password.</p>

            <form onSubmit={handlePasswordReset}>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-colors mb-4"
                placeholder="tu@email.com"
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                  Annulla
                </button>
                <button type="submit" disabled={resetSending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-70 flex items-center justify-center gap-2">
                  {resetSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Invio...
                    </>
                  ) : 'Invia Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
