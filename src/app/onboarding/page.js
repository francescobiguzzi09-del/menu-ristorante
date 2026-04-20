"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

// Brand palette
const B = {
  espresso: '#2D2016',
  terracotta: '#C4622D',
  ambra: '#E8A84A',
  oliva: '#4A7C59',
  crema: '#F5F0E8',
  carbone: '#2C2C2A',
};

export default function OnboardingWizard() {
  const router = useRouter();
  const toast = useToast();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  
  // Data State
  const [restaurantName, setRestaurantName] = useState('');
  const [useAI, setUseAI] = useState(null);
  const [aiItems, setAiItems] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [template, setTemplate] = useState('modern');
  const [createdMenuId, setCreatedMenuId] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Check Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });
  }, [router]);

  const handleNext = () => {
    setDirection('forward');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection('backward');
    setStep((prev) => prev - 1);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleAiUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsAiLoading(true);
    
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;

      const res = await fetch('/api/parse-menu', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      const data = await res.json();
      if (data.success && data.data) {
        setAiItems(data.data);
        handleNext();
      } else {
        toast.error(data.error || "Errore durante l'analisi IA dell'immagine.", 'Errore IA');
      }
    } catch (err) {
      toast.error('Errore di connessione al server IA.', 'Errore');
      console.error(err);
    } finally {
      setIsAiLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  
  useEffect(() => {
    if (step === 4 && createdMenuId) {
      const timer = setTimeout(() => {
        router.push(`/admin?id=${createdMenuId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, createdMenuId, router]);

  const finishOnboarding = async () => {
    setIsSaving(true);
    try {
      const newId = 'menu-' + Math.random().toString(36).substr(2, 9);
      
      const newSettings = {
        restaurantName: restaurantName || "Mio Ristorante",
        template: template || "modern",
        whiteLabel: false,
        enableOrdering: false,
        currency: "€"
      };

      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: newId,
          data: { 
            settings: newSettings, 
            menu: aiItems 
          },
          userId: user.id
        })
      });

      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error);
      
      setCreatedMenuId(newId);
      setStep(4);
      setTimeout(() => {
        router.push(`/admin?id=${newId}`);
      }, 7000);

    } catch (err) {
      toast.error('Errore durante la creazione del menù: ' + err.message, 'Errore');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: B.espresso }}><div style={{ width: 32, height: 32, borderRadius: '50%', border: `4px solid ${B.terracotta}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} /></div>;
  }

  return (
    <div style={{
      minHeight: '100vh', background: B.espresso, color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative', overflow: 'hidden',
      fontFamily: "var(--font-inter), 'Inter', sans-serif",
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 380, height: 380, borderRadius: '50%', background: B.terracotta, opacity: 0.06, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 380, height: 380, borderRadius: '50%', background: B.oliva, opacity: 0.06, pointerEvents: 'none' }} />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ maxWidth: 600, width: '100%', position: 'relative', zIndex: 10, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
        
        {/* Progress */}
        {step < 4 && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <button onClick={() => step === 1 ? router.push('/dashboard') : handleBack()} style={{
              fontSize: 13, fontWeight: 500, color: 'rgba(245,240,232,0.4)', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              {step === 1 ? "Torna al menu principale" : "Torna Indietro"}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 6, borderRadius: 3, transition: 'all .5s',
                  width: step === i ? 32 : 6,
                  background: step >= i ? B.terracotta : 'rgba(245,240,232,0.12)',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 1: RESTAURANT NAME --- */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: B.crema, marginBottom: 12 }}>Iniziamo dal nome.</h1>
            <p style={{ fontSize: 16, color: 'rgba(245,240,232,0.4)', marginBottom: 40, maxWidth: 440 }}>Iniziamo dalle basi. In quale locale stiamo per fare la magia?</p>
            
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(245,240,232,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nome Ristorante</label>
              <input 
                type="text" 
                autoFocus
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="es. Pizzeria da Mario"
                style={{
                  width: '100%', background: 'rgba(245,240,232,0.06)', border: '1.5px solid rgba(245,240,232,0.12)',
                  borderRadius: 16, padding: '16px 20px', fontSize: 18, fontWeight: 600, color: B.crema,
                  outline: 'none', transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)', boxSizing: 'border-box', marginBottom: 20,
                }}
                onFocus={e => e.target.style.borderColor = B.terracotta}
                onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.12)'}
                onKeyDown={(e) => e.key === 'Enter' && restaurantName && handleNext()}
              />
              <button 
                disabled={!restaurantName.trim()}
                onClick={handleNext} 
                style={{
                  width: '100%', background: B.crema, color: B.espresso, fontWeight: 700,
                  padding: '16px 24px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  fontSize: 16, transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                  opacity: !restaurantName.trim() ? 0.5 : 1,
                  boxShadow: '0 0 40px -10px rgba(245,240,232,0.2)',
                }}
              >
                Continua
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: AI IMPORT --- */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: B.crema, marginBottom: 12 }}>Scegli come iniziare.</h1>
            <p style={{ fontSize: 16, color: 'rgba(245,240,232,0.4)', marginBottom: 32 }}>Carica una foto del tuo menù cartaceo e la nostra IA estrarrà piatti e prezzi in 10 secondi.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Option AI */}
              <button 
                onClick={() => { setUseAI(true); triggerFileInput(); }}
                disabled={isAiLoading}
                style={{
                  transform: 'translateY(0) scale(1)',
                  position: 'relative', background: `linear-gradient(135deg, rgba(196,98,45,0.15), rgba(196,98,45,0.05))`,
                  border: `2px solid rgba(196,98,45,0.25)`, borderRadius: 20, padding: 28,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', cursor: 'pointer', transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden',
                }} 
                onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(196,98,45,0.2)';}}
                onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none';}}
              >
                {isAiLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(45,32,22,0.85)', backdropFilter: 'blur(4px)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 36, height: 36, border: `4px solid ${B.terracotta}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                    <p style={{ fontWeight: 500, fontSize: 13, color: B.ambra }}>L&apos;IA sta estraendo i piatti...</p>
                  </div>
                )}
                <div style={{ width: 56, height: 56, background: 'rgba(196,98,45,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={B.terracotta} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display), serif', fontWeight: 500, fontSize: 18, color: B.crema, marginBottom: 8 }}>Usa l&apos;Intelligenza Artificiale</h3>
                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', fontWeight: 500 }}>Consigliato. Carica un PDF o un&apos;immagine PNG/JPG (Max 5MB).</p>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAiUpload} 
                accept="image/png, image/jpeg, image/webp, application/pdf" 
                style={{ display: 'none' }} 
              />

              {/* Option Manual */}
              <button 
                onClick={() => { setUseAI(false); handleNext(); }}
                disabled={isAiLoading}
                style={{
                  transform: 'translateY(0) scale(1)',
                  position: 'relative', background: 'rgba(245,240,232,0.04)',
                  border: '2px solid rgba(245,240,232,0.1)', borderRadius: 20, padding: 28,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', cursor: 'pointer', transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
                }} 
                onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(245,240,232,0.05)';}}
                onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none';}}
              >
                <div style={{ width: 56, height: 56, background: 'rgba(245,240,232,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display), serif', fontWeight: 500, fontSize: 18, color: B.crema, marginBottom: 8 }}>Creazione Manuale</h3>
                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)', fontWeight: 500 }}>Inserisci le categorie e i piatti uno ad uno dalla Dashboard.</p>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: TEMPLATE SELECTION --- */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: B.crema, marginBottom: 12 }}>Scegli l&apos;Estetica.</h1>
            <p style={{ fontSize: 16, color: 'rgba(245,240,232,0.4)', marginBottom: 28 }}>Non preoccuparti, potrai cambiare colori e layout in qualsiasi momento.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { id: 'modern', label: 'Modern', letterBg: '#fff', letterColor: B.espresso, borderActive: B.terracotta, bgActive: 'rgba(196,98,45,0.1)' },
                { id: 'sushi', label: 'Sushi', letterBg: B.espresso, letterColor: B.oliva, borderActive: B.oliva, bgActive: 'rgba(74,124,89,0.1)' },
                { id: 'elegant', label: 'Elegant', letterBg: 'transparent', letterColor: '#c9a66b', borderActive: '#c9a66b', bgActive: 'rgba(201,166,107,0.1)', letterBorder: '1px solid #c9a66b', letterRound: '50%' },
                { id: 'vibrant', label: 'Vibrant', letterBg: '#4338ca', letterColor: '#fff', borderActive: '#E8A84A', bgActive: 'rgba(232,168,74,0.1)', letterRound: 12, letterRotate: '-6deg' },
              ].map(t => (
                <div 
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{
                    transform: 'scale(1)',
                    cursor: 'pointer', borderRadius: 16, border: `2px solid ${template === t.id ? t.borderActive : 'rgba(245,240,232,0.08)'}`,
                    background: template === t.id ? t.bgActive : 'rgba(245,240,232,0.03)',
                    padding: 16, aspectRatio: '4/5', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end', transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => {e.currentTarget.style.transform = 'scale(1.03)';}}
                  onMouseLeave={e => {e.currentTarget.style.transform = 'scale(1)';}}
                >
                  <div style={{
                    width: 40, height: 40, marginBottom: 'auto', marginTop: 8,
                    borderRadius: t.letterRound || 8, background: t.letterBg, border: t.letterBorder || 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.letterColor, fontWeight: 700, fontSize: 18,
                    transform: t.letterRotate ? `rotate(${t.letterRotate})` : 'none',
                    fontFamily: t.id === 'elegant' ? 'serif' : 'sans-serif',
                    fontStyle: t.id === 'elegant' ? 'italic' : 'normal',
                  }}>{t.label.charAt(0)}</div>
                  <h4 style={{
                    color: B.crema, fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
                    letterSpacing: t.id === 'modern' ? '-0.03em' : '0.1em',
                    fontFamily: t.id === 'sushi' ? 'monospace' : t.id === 'elegant' ? 'serif' : 'sans-serif',
                  }}>{t.label}</h4>
                </div>
              ))}
            </div>

            <button 
              disabled={isSaving}
              onClick={finishOnboarding} 
              style={{
                width: '100%', background: B.crema, color: B.espresso, fontWeight: 700,
                padding: '16px 24px', borderRadius: 16, border: 'none', cursor: 'pointer',
                fontSize: 16, transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                opacity: isSaving ? 0.6 : 1,
                boxShadow: '0 0 40px -10px rgba(245,240,232,0.2)',
              }}
            >
              {isSaving ? 'Creazione in corso...' : 'Crea il mio menù'}
              {!isSaving && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
            </button>
          </div>
        )}

        {/* --- STEP 4: SUCCESS --- */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 'clamp(200px, 50vw, 320px)', marginBottom: 24 }}>
              <video 
                src="/success-video.webm" 
                autoPlay 
                muted 
                playsInline
                onEnded={() => {
                  if (createdMenuId) router.push(`/admin?id=${createdMenuId}`);
                }}
                style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
              />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: B.crema, marginBottom: 12 }}>Il Tuo Menù è Pronto!</h1>
            <p style={{ fontSize: 18, color: B.oliva, marginBottom: 24, fontWeight: 500 }}>Preparati alla perfezione. Reindirizzamento al Cruscotto in corso...</p>
            <div style={{ width: 40, height: 40, border: `4px solid ${B.terracotta}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

      </div>
    </div>
  );
}
