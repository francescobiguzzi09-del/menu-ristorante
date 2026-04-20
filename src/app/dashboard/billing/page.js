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
  const [currentPlan, setCurrentPlan] = useState('free');
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
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', color: 'rgba(45,32,22,0.4)' }}>Caricamento Piani...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', color: '#2C2C2A', fontFamily: "var(--font-inter), 'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px', flex: 1, width: '100%' }}>
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
          color: 'rgba(45,32,22,0.45)', textDecoration: 'none', marginBottom: 32,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 500, color: '#2D2016', marginBottom: 12 }}>Stiamo crescendo: per te è tutto Gratis!</h1>
          <p style={{ fontSize: 15, color: 'rgba(45,32,22,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>Siamo in fase di Accesso Beta. Come nostro pioniere, ottieni l&apos;accesso a tutte le funzionalità Premium gratuitamente.</p>
        </div>

        {/* BETA ALL-ACCESS CARD */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            background: '#2D2016', borderRadius: 24, padding: '40px 36px',
            border: `2px solid rgba(196,98,45,0.3)`, position: 'relative', overflow: 'hidden',
            textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, borderRadius: '50%', background: '#C4622D', opacity: 0.08, marginLeft: -60, marginTop: -60, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: '#E8A84A', opacity: 0.06, marginRight: -60, marginBottom: -60, pointerEvents: 'none' }} />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <span style={{
                display: 'inline-block', background: 'rgba(74,124,89,0.25)', color: '#4A7C59',
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '4px 14px', borderRadius: 20, marginBottom: 20,
              }}>Piano Attivo</span>
              
              <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 32, fontWeight: 500, color: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8A84A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Accesso Beta Pioniere
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 48, fontWeight: 500, color: '#F5F0E8' }}>€0</span>
                <span style={{ color: 'rgba(245,240,232,0.35)', fontSize: 15, marginBottom: 8, position: 'relative' }}>
                  <span style={{ position: 'absolute', width: '100%', height: 2, background: '#dc2626', top: '50%', transform: 'rotate(-12deg)' }} />
                  €29/mese
                </span>
              </div>
              
              <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
                Tutto sbloccato. Menù illimitati, analytics, traduzioni IA, template premium e molto altro.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 28, maxWidth: 460, margin: '0 auto 28px', textAlign: 'left' }}>
                {[
                  'Menù e Piatti Illimitati',
                  'Dashboard Analytics',
                  'Temi Luxury e Cinematic',
                  'Nessun Logo "Powered By"',
                  'Traduzione Automatica (IA)',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(245,240,232,0.7)', fontWeight: 500 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(74,124,89,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                    </span>
                    {item}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(245,240,232,0.35)', fontWeight: 500 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(245,240,232,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </span>
                  Ordini via Stripe <span style={{ fontSize: 9, marginLeft: 4, background: 'rgba(232,168,74,0.15)', color: '#E8A84A', padding: '2px 6px', borderRadius: 4 }}>In Arrivo</span>
                </div>
              </div>

              <button 
                disabled
                style={{
                  background: 'rgba(245,240,232,0.08)', color: '#F5F0E8', border: '1px solid rgba(245,240,232,0.12)',
                  fontWeight: 500, padding: '14px 28px', borderRadius: 12, cursor: 'default',
                  fontSize: 14, width: '100%', maxWidth: 380,
                }}
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
