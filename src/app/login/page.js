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
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 24, fontFamily: "var(--font-inter), 'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(45,32,22,0.08)', border: '1px solid rgba(45,32,22,0.06)', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <img src="/sm-logo.svg" alt="SmartMenu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>
            {isLogin ? 'Bentornato' : 'Crea il tuo Account'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)' }}>
            {isLogin ? 'Accedi per gestire i tuoi menù digitali.' : 'Inizia a creare menù illimitati gratis.'}
          </p>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: 12, borderRadius: 12, marginBottom: 20, border: '1px solid #fecaca' }}>{error}</div>}

        <button
          onClick={handleGoogleLogin}
          type="button"
          style={{
            width: '100%', background: '#fff', border: '2px solid rgba(45,32,22,0.12)',
            color: '#2D2016', fontWeight: 600, padding: '14px 16px', borderRadius: 12,
            marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 12, fontSize: 14, transition: 'all .2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continua con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(45,32,22,0.1)' }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(45,32,22,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oppure con email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(45,32,22,0.1)' }} />
        </div>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(45,32,22,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', border: '1.5px solid rgba(45,32,22,0.12)',
                borderRadius: 12, background: '#FAFAF7', fontSize: 14, fontWeight: 500,
                outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#C4622D'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.12)'; e.target.style.background = '#FAFAF7'; }}
              placeholder="tu@email.com"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(45,32,22,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PASSWORD (Min 6 caratteri)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', border: '1.5px solid rgba(45,32,22,0.12)',
                borderRadius: 12, background: '#FAFAF7', fontSize: 14, fontWeight: 500,
                outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#C4622D'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.12)'; e.target.style.background = '#FAFAF7'; }}
              placeholder="••••••••"
            />
          </div>

          {/* Forgot Password Link */}
          {isLogin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#C4622D', cursor: 'pointer', padding: 0 }}
              >
                Password dimenticata?
              </button>
            </div>
          )}

          {!isLogin && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: '#C4622D', cursor: 'pointer' }}
              />
              <label htmlFor="terms" style={{ fontSize: 12, color: 'rgba(45,32,22,0.55)', lineHeight: 1.4 }}>
                Accetto i <a href="/termini" target="_blank" style={{ fontWeight: 600, color: '#C4622D', textDecoration: 'underline' }}>termini d&apos;uso</a> e la <a href="/privacy" target="_blank" style={{ fontWeight: 600, color: '#C4622D', textDecoration: 'underline' }}>privacy policy</a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || password.length < 6 || (!isLogin && !acceptTerms)}
            style={{
              width: '100%', background: '#2D2016', color: '#F5F0E8', fontWeight: 600,
              padding: '14px 16px', borderRadius: 12, marginTop: 16, border: 'none',
              fontSize: 14, cursor: 'pointer', transition: 'all .2s',
              opacity: (isLoading || password.length < 6 || (!isLogin && !acceptTerms)) ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Crea Account')}
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'rgba(45,32,22,0.5)' }}>{isLogin ? "Non hai un account?" : "Hai già un account?"}</span>{' '}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', fontWeight: 600, color: '#C4622D', cursor: 'pointer', padding: 0, fontSize: 14 }}>
            {isLogin ? "Registrati" : "Accedi"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <a href="/admin" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.4)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
          Continua come Ospite (Senza salvare)
        </a>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,32,22,0.6)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowForgotPassword(false)}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(45,32,22,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: 'rgba(196,98,45,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 500, color: '#2D2016', textAlign: 'center', marginBottom: 8 }}>Recupera Password</h3>
            <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)', textAlign: 'center', marginBottom: 24 }}>Inserisci la tua email e ti invieremo un link per reimpostare la password.</p>

            <form onSubmit={handlePasswordReset}>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid rgba(45,32,22,0.12)',
                  borderRadius: 12, background: '#FAFAF7', fontSize: 14, fontWeight: 500,
                  outline: 'none', marginBottom: 16, boxSizing: 'border-box',
                }}
                placeholder="tu@email.com"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowForgotPassword(false)} style={{
                  flex: 1, background: '#F5F0E8', border: 'none', color: '#2D2016',
                  fontWeight: 600, padding: 12, borderRadius: 12, cursor: 'pointer', fontSize: 14,
                }}>
                  Annulla
                </button>
                <button type="submit" disabled={resetSending} style={{
                  flex: 1, background: '#C4622D', border: 'none', color: '#F5F0E8',
                  fontWeight: 600, padding: 12, borderRadius: 12, cursor: 'pointer', fontSize: 14,
                  opacity: resetSending ? 0.7 : 1,
                }}>
                  {resetSending ? 'Invio...' : 'Invia Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
