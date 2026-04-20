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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', color: 'rgba(45,32,22,0.4)' }}>Caricamento...</div>;

  const isBanned = profile?.status === 'banned';

  return (
    <div style={{
      minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "var(--font-inter), 'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative */}
      <div style={{ position: 'absolute', top: 0, right: 0, marginRight: -80, marginTop: -80, width: 380, height: 380, borderRadius: '50%', background: '#C4622D', opacity: 0.04, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, marginLeft: -80, marginBottom: -80, width: 380, height: 380, borderRadius: '50%', background: '#E8A84A', opacity: 0.04, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 500, width: '100%', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(45,32,22,0.08)', border: '1px solid rgba(45,32,22,0.06)', padding: '36px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: 64, height: 64, background: 'rgba(220,38,38,0.06)', color: '#dc2626', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          {isBanned ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          )}
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#2D2016', textAlign: 'center', marginBottom: 12 }}>
          {isBanned ? "Account Bannato" : "Account Sospeso"}
        </h1>
        
        <div style={{ textAlign: 'center', color: 'rgba(45,32,22,0.6)', marginBottom: 28, lineHeight: 1.6, fontSize: 14 }}>
          {isBanned ? (
            <p>Il tuo account è stato permanentemente rimosso dall&apos;amministrazione per violazione dei Termini di Servizio. I tuoi menù non sono più visibili.</p>
          ) : (
            <p>Il tuo account è stato temporaneamente sospeso. Potrai tornare a gestire i tuoi menù a partire dal: 
              <br /><br />
              <strong style={{ color: '#dc2626', fontSize: 18, fontWeight: 700, background: 'rgba(220,38,38,0.05)', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(220,38,38,0.1)', display: 'inline-block' }}>
                {new Date(profile.suspended_until).toLocaleString('it-IT')}
              </strong>
            </p>
          )}
        </div>

        {!appealSent ? (
          <form onSubmit={handleAppealSubmit} style={{ background: '#F5F0E8', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, fontSize: 15, color: '#2D2016', marginBottom: 8 }}>Pensi ci sia un errore?</h3>
            <p style={{ fontSize: 13, color: 'rgba(45,32,22,0.5)', marginBottom: 12 }}>Puoi inviare un reclamo al nostro team amministrativo.</p>
            <textarea 
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi qui il tuo reclamo..."
              style={{
                width: '100%', background: '#fff', border: '1.5px solid rgba(45,32,22,0.1)', borderRadius: 12,
                padding: 12, fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 12,
                boxSizing: 'border-box', fontFamily: "var(--font-inter), sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = '#C4622D'}
              onBlur={e => e.target.style.borderColor = 'rgba(45,32,22,0.1)'}
              required
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              style={{
                width: '100%', background: '#C4622D', color: '#F5F0E8', fontWeight: 600,
                padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 14, opacity: (isSubmitting || !message.trim()) ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Reclamo'}
            </button>
          </form>
        ) : (
          <div style={{
            background: 'rgba(74,124,89,0.06)', border: '1px solid rgba(74,124,89,0.15)',
            color: '#4A7C59', padding: '16px 20px', borderRadius: 16, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500, fontSize: 14,
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Reclamo inviato con successo. L&apos;amministrazione lo valuterà a breve.
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', fontSize: 13, fontWeight: 500,
            color: 'rgba(45,32,22,0.45)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 4, padding: 0,
          }}>
            Esci dall&apos;Account
          </button>
        </div>
      </div>
    </div>
  );
}
