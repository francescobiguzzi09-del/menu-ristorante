"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useToast } from '@/components/Toast';

export default function UpdatesPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Admin form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  useEffect(() => {
    const fetchUpdates = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/updates');
        const data = await res.json();
        if (data.success) {
          setUpdates(data.updates || []);
          
          // Mark as read in localStorage
          if (data.updates && data.updates.length > 0) {
            localStorage.setItem('smartmenu_last_read_update', data.updates[0].created_at);
            // Trigger a custom event so the top bar bell icon can update its dot
            window.dispatchEvent(new Event('updates_read'));
          }
        }
      } catch (err) {
        console.error("Failed to fetch updates:", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchUpdates();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.warning('Inserisci titolo e contenuto.', 'Campi vuoti');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          userEmail: user?.email
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setUpdates([data.update, ...updates]);
        setTitle('');
        setContent('');
        toast.success('Aggiornamento pubblicato con successo!');
        localStorage.setItem('smartmenu_last_read_update', data.update.created_at);
        window.dispatchEvent(new Event('updates_read'));
      } else {
        toast.error(data.error || 'Errore durante la pubblicazione.', 'Errore');
      }
    } catch (err) {
      toast.error('Errore di connessione al server.', 'Errore');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', color: 'rgba(45,32,22,0.4)' }}>Caricamento...</div>;

  const isAdmin = user?.email === 'francesco.biguzzi09@gmail.com';

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', color: '#2C2C2A', fontFamily: "var(--font-inter), 'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', flex: 1, width: '100%' }}>
        
        {/* BACK BUTTON */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
          color: 'rgba(45,32,22,0.45)', textDecoration: 'none', marginBottom: 32, transition: 'color .2s',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Torna alla Dashboard
        </Link>
        
        {/* HEADER */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #C4622D, #D97746)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(196,98,45,0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 32, fontWeight: 500, color: '#2D2016' }}>Aggiornamenti</h1>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(45,32,22,0.6)', lineHeight: 1.5, marginLeft: 60 }}>
            Scopri le ultime novità, funzionalità e miglioramenti della piattaforma SmartMenu.
          </p>
        </div>

        {/* ADMIN FORM */}
        {isAdmin && (
          <div style={{
            background: '#fff', borderRadius: 24, padding: '28px', border: '2px solid rgba(196,98,45,0.2)',
            boxShadow: '0 12px 30px rgba(196,98,45,0.08)', marginBottom: 48, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #C4622D, #F5F0E8)' }} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#C4622D', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Pubblica un nuovo Aggiornamento (Admin)
            </h2>
            <form onSubmit={handlePublish}>
              <input 
                type="text" 
                placeholder="Titolo dell'aggiornamento..." 
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(45,32,22,0.1)', borderRadius: 12, fontSize: 15, fontWeight: 600, outline: 'none', marginBottom: 16, background: '#FAFAF7', color: '#2D2016' }}
              />
              <textarea 
                placeholder="Descrizione delle novità (supporta paragrafi e a capo)..." 
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(45,32,22,0.1)', borderRadius: 12, fontSize: 14, outline: 'none', marginBottom: 20, background: '#FAFAF7', resize: 'vertical', color: '#2D2016', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{
                    background: '#C4622D', color: '#fff', fontWeight: 600, padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Pubblicazione...' : 'Pubblica a tutti gli utenti'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TIMELINE OF UPDATES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
          {isFetching ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(45,32,22,0.4)', fontWeight: 500 }}>Ricerca aggiornamenti...</div>
          ) : updates.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed rgba(45,32,22,0.1)' }}>
              <div style={{ width: 64, height: 64, background: '#FAF8F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(45,32,22,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2D2016', marginBottom: 8 }}>Nessun aggiornamento</h3>
              <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)' }}>La piattaforma è attiva e funzionante. Le novità appariranno qui.</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 2, background: 'linear-gradient(to bottom, rgba(196,98,45,0.3), rgba(196,98,45,0))', zIndex: 0 }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {updates.map((update, index) => {
                  const date = new Date(update.created_at);
                  const isLatest = index === 0;
                  
                  return (
                    <div key={update.id} style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
                      {/* Timeline Dot */}
                      <div style={{ width: 48, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ 
                          width: isLatest ? 20 : 16, height: isLatest ? 20 : 16, 
                          borderRadius: '50%', background: isLatest ? '#C4622D' : '#fff',
                          border: `4px solid ${isLatest ? 'rgba(196,98,45,0.2)' : 'rgba(45,32,22,0.1)'}`,
                          boxShadow: isLatest ? '0 0 0 4px rgba(196,98,45,0.1)' : 'none',
                          marginTop: 4, transition: 'all .3s'
                        }} />
                      </div>
                      
                      {/* Content Card */}
                      <div style={{
                        background: '#fff', borderRadius: 20, padding: 28, flex: 1,
                        boxShadow: isLatest ? '0 12px 40px rgba(45,32,22,0.06)' : '0 4px 16px rgba(45,32,22,0.03)',
                        border: isLatest ? '1px solid rgba(196,98,45,0.15)' : '1px solid rgba(45,32,22,0.06)',
                        transition: 'transform .2s',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2D2016', m: 0 }}>{update.title}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isLatest && (
                              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#C4622D', background: 'rgba(196,98,45,0.1)', padding: '4px 8px', borderRadius: 6 }}>
                                Nuovo
                              </span>
                            )}
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.4)' }}>
                              {date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: 15, color: 'rgba(45,32,22,0.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                          {update.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
