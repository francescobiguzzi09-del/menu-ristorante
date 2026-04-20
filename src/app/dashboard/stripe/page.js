"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';

export default function StripeSettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState('not_connected');
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [connectedMenuName, setConnectedMenuName] = useState(null);
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
      
      const { data: menus } = await supabase
        .from('menus')
        .select('restaurant_id, data')
        .eq('user_id', session.user.id);

      if (menus && menus.length > 0) {
        const menuWithStripe = menus.find(m => m.data?.settings?.stripeAccountId);
        if (menuWithStripe) {
          setStripeStatus('active');
          setStripeAccountId(menuWithStripe.data.settings.stripeAccountId);
          setConnectedMenuName(menuWithStripe.data.settings.restaurantName || menuWithStripe.restaurant_id);
        }
      }

      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', color: 'rgba(45,32,22,0.4)' }}>Caricamento...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', color: '#2C2C2A', fontFamily: "var(--font-inter), 'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', flex: 1, width: '100%' }}>
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
          color: 'rgba(45,32,22,0.45)', textDecoration: 'none', marginBottom: 32,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>Pagamenti e Incassi (Stripe)</h1>
          <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)', maxWidth: 540, lineHeight: 1.6 }}>Collega il tuo conto bancario per iniziare ad accettare pagamenti digitali (Carte di credito, Apple Pay, Google Pay) direttamente dai tuoi menù online.</p>
        </div>

        {/* STATUS CARD */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '32px 28px',
          border: '1px solid rgba(220,38,38,0.12)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: 'rgba(220,38,38,0.03)', marginRight: -60, marginTop: -60, pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.1)',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 18, fontWeight: 600, color: '#2D2016', marginBottom: 4 }}>Funzionalità Sospesa Temporaneamente</h3>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626' }}>
                  Integrazione Pagamenti in Manutenzione
                </div>
              </div>
            </div>

            <div style={{
              background: '#F5F0E8', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 16,
              padding: 20, maxWidth: 520,
            }}>
              <h4 style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, fontSize: 14, color: '#2D2016', marginBottom: 8 }}>Perché i pagamenti sono disabilitati?</h4>
              <p style={{ fontSize: 13, color: 'rgba(45,32,22,0.55)', lineHeight: 1.6, marginBottom: 12 }}>
                Stiamo ultimando un aggiornamento importante al nostro partner di pagamento (Stripe) per rispettare le nuove normative vigenti.
              </p>
              <p style={{ fontSize: 13, color: 'rgba(45,32,22,0.55)', lineHeight: 1.6, fontWeight: 600 }}>
                Questa funzione tornerà presto disponibile. Nel frattempo, puoi usare gratis tutte le altre funzionalità premium.
              </p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
