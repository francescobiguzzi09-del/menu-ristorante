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
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 24, fontFamily: "var(--font-inter), 'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(45,32,22,0.08)', border: '1px solid rgba(45,32,22,0.06)', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(196,98,45,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, fontWeight: 500, color: '#2D2016' }}>
            {done ? 'Password Aggiornata!' : 'Nuova Password'}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)', marginTop: 8 }}>
            {done ? 'Sarai reindirizzato alla dashboard tra pochi secondi.' : 'Scegli una nuova password per il tuo account SmartMenu AI.'}
          </p>
        </div>

        {!done && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(45,32,22,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NUOVA PASSWORD</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid rgba(45,32,22,0.12)',
                  borderRadius: 12, background: '#FAFAF7', fontSize: 14, fontWeight: 500,
                  outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#C4622D'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.12)'; e.target.style.background = '#FAFAF7'; }}
                placeholder="Minimo 6 caratteri"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(45,32,22,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CONFERMA PASSWORD</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid rgba(45,32,22,0.12)',
                  borderRadius: 12, background: '#FAFAF7', fontSize: 14, fontWeight: 500,
                  outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#C4622D'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.12)'; e.target.style.background = '#FAFAF7'; }}
                placeholder="Ripeti la password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || newPassword.length < 6}
              style={{
                width: '100%', background: '#C4622D', color: '#F5F0E8', fontWeight: 600,
                padding: '14px 16px', borderRadius: 12, marginTop: 8, border: 'none',
                fontSize: 14, cursor: 'pointer', transition: 'all .2s',
                opacity: (isLoading || newPassword.length < 6) ? 0.5 : 1,
              }}
            >
              {isLoading ? 'Aggiornamento...' : 'Aggiorna Password'}
            </button>
          </form>
        )}

        {done && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(74,124,89,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)' }}>Reindirizzamento in corso...</p>
          </div>
        )}
      </div>
    </div>
  );
}
