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

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', color: 'rgba(45,32,22,0.4)' }}>Caricamento Impostazioni...</div>;

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '1.5px solid rgba(45,32,22,0.12)',
    borderRadius: 12, background: '#FAFAF7', fontSize: 16, fontWeight: 500,
    outline: 'none', transition: 'all .2s', boxSizing: 'border-box', color: '#2D2016',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', color: '#2C2C2A', fontFamily: "var(--font-inter), 'Inter', sans-serif", display: 'flex', flexDirection: 'column', transition: 'all .3s' }}>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', flex: 1, width: '100%' }}>
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
          color: 'rgba(45,32,22,0.45)', textDecoration: 'none', marginBottom: 32, transition: 'color .2s',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>Impostazioni Profilo</h1>
          <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)' }}>Aggiorna le tue informazioni personali e gestisci la sicurezza del tuo account.</p>
        </div>

        {/* SETTINGS FORM */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '28px 28px', border: '1px solid rgba(45,32,22,0.06)',
          boxShadow: '0 4px 16px rgba(45,32,22,0.04)', marginBottom: 24,
        }}>
          <h2 style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 16, fontWeight: 600, color: '#2D2016', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16, borderBottom: '1px solid rgba(45,32,22,0.06)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
            Informazioni Personali
          </h2>
          
          <form onSubmit={handleSave}>
            {/* Email Field (Disabled) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.6)', marginBottom: 8 }}>Indirizzo Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: 12, color: 'rgba(45,32,22,0.35)', marginTop: 6 }}>L&apos;indirizzo email non può essere modificato per motivi di sicurezza.</p>
            </div>

            {/* Name Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.6)', marginBottom: 8 }}>Nome Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Es. Mario Rossi"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C4622D'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.12)'; e.target.style.background = '#FAFAF7'; }}
              />
              <p style={{ fontSize: 12, color: 'rgba(45,32,22,0.35)', marginTop: 6 }}>Questo nome verrà visualizzato nel banner della Dashboard.</p>
            </div>

            {/* Phone Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.6)', marginBottom: 8 }}>Numero di Telefono (Opzionale)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 1234567"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C4622D'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.12)'; e.target.style.background = '#FAFAF7'; }}
              />
              <p style={{ fontSize: 12, color: 'rgba(45,32,22,0.35)', marginTop: 6 }}>Utilizzato per eventuale supporto diretto. Non condiviso con terze parti.</p>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(45,32,22,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                disabled={isSaving}
                style={{
                  fontWeight: 600, padding: '12px 28px', borderRadius: 12, border: 'none',
                  fontSize: 14, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8,
                  background: saved ? '#4A7C59' : '#C4622D', color: '#F5F0E8',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin" style={{ width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
        <div style={{
          background: 'rgba(220,38,38,0.04)', borderRadius: 24, padding: '28px 28px',
          border: '1px solid rgba(220,38,38,0.1)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 16, fontWeight: 600, color: '#991b1b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            Zona Pericolosa
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(153,27,27,0.6)', marginBottom: 20, lineHeight: 1.6 }}>Attenzione: l&apos;eliminazione dell&apos;account rimuoverà tutti i tuoi menù, piatti e lo storico degli ordini definitivamente.</p>
          <button 
            onClick={handleDeleteAccount}
            style={{
              background: '#fff', border: '2px solid rgba(220,38,38,0.2)', color: '#dc2626',
              fontWeight: 600, padding: '12px 24px', borderRadius: 12, cursor: 'pointer',
              fontSize: 14, transition: 'all .2s',
            }}
          >
            Elimina Account Definitivamente
          </button>
        </div>

      </main>
      <Footer />

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,32,22,0.6)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(45,32,22,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, background: 'rgba(220,38,38,0.08)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 500, color: '#2D2016', textAlign: 'center', marginBottom: 8 }}>Elimina Account</h3>
            <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.55)', textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>Sei sicuro di voler eliminare definitivamente il tuo account e tutti i menù annessi? Questa operazione è <strong style={{ color: '#dc2626' }}>irreversibile</strong>.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, background: '#F5F0E8', border: 'none', color: '#2D2016', fontWeight: 600, padding: 12, borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>Annulla</button>
              <button onClick={confirmDeleteAccount} style={{ flex: 1, background: '#dc2626', border: 'none', color: '#fff', fontWeight: 600, padding: 12, borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
