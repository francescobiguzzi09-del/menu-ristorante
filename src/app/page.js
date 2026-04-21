"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

// ─── Brand colors ─────────────────────────────────────────────────────────────
const T = {
  espresso: '#2D2016',
  terracotta: '#C4622D',
  ambra: '#E8A84A',
  oliva: '#4A7C59',
  crema: '#F5F0E8',
  carbone: '#2C2C2A',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { n: '500+', label: 'ristoranti attivi in Italia' },
  { n: '12 s', label: 'tempo medio di scansione QR' },
  { n: '4.8★', label: 'valutazione media dai ristoratori' },
];

const STEPS = [
  {
    n: '1',
    title: 'Scatta o carica una foto',
    body: 'Fai una foto al tuo menù cartaceo, alla lavagna o a un PDF. Nessun formato speciale richiesto.',
  },
  {
    n: '2',
    title: "L'AI costruisce il menù",
    body: 'Riconosce automaticamente piatti, prezzi, categorie e allergeni. Tu correggi e personalizzi tutto.',
  },
  {
    n: '3',
    title: 'Condividi il QR code',
    body: 'Stampa il QR, incollalo sui tavoli. I clienti lo scansionano e vedono il menù — in italiano o nella loro lingua.',
  },
];

const TEMPLATES = [
  { name: 'Elegant', mood: 'Dark · Fine dining', bg: '#0a0a0b', color: '#c9a66b' },
  { name: 'Modern', mood: 'Light · Minimal', bg: '#f4f0e8', color: '#2c2c2a' },
  { name: 'Rustic', mood: 'Caldo · Trattoria', bg: '#2d1a0e', color: '#c8956c' },
  { name: 'Luxury', mood: 'Premium · Esclusivo', bg: '#1a0a00', color: '#d4a96a' },
  { name: 'Vibrant', mood: 'Pop · Colorato', bg: '#1a1a2e', color: '#e94560' },
  { name: 'Sushi', mood: 'Zen · Minimalista', bg: '#f8f5f0', color: '#8b0000' },
];

const REVIEWS = [
  {
    initials: 'MC',
    name: 'Marco C.',
    place: 'Osteria da Marco — Bologna',
    detail: '45 coperti · Cucina bolognese',
    stars: 5,
    text: '"Prima ristampavamo il menù ogni settimana. Ora aggiorno tutto in 30 secondi dal telefono. I turisti stranieri sono felicissimi della traduzione automatica."',
    bg: '#FAECE7',
    color: '#712B13',
  },
  {
    initials: 'SA',
    name: 'Sara A.',
    place: "Pizzeria Napul'è — Milano",
    detail: 'Delivery + sala · 60 coperti',
    stars: 5,
    text: '"Ho creato il menù in un pomeriggio. I clienti ordinano dal tavolo senza aspettare il cameriere. Il fatturato da asporto è salito del 20%."',
    bg: '#EAF3DE',
    color: '#27500A',
  },
  {
    initials: 'RL',
    name: 'Roberto L.',
    place: 'Agriturismo La Valle — Chianti',
    detail: 'Stagionale · Menù settimanale',
    stars: 5,
    text: '"Cambiamo menù ogni settimana in base alla stagione. Prima era un incubo. Adesso carico la foto e in 2 minuti è online. Impagabile."',
    bg: '#FAEEDA',
    color: '#633806',
  },
];

const PLAN_FREE = [
  { ok: true,  text: '1 menù digitale' },
  { ok: true,  text: 'QR code incluso' },
  { ok: true,  text: 'Template Modern e Rustic' },
  { ok: false, text: 'Solo lingua italiana' },
  { ok: false, text: 'Badge SmartMenu visibile' },
];

const PLAN_PRO = [
  { ok: true, text: 'Menù illimitati' },
  { ok: true, text: 'Tutti i template (incluso Luxury)' },
  { ok: true, text: 'Traduzione in 10+ lingue' },
  { ok: true, text: 'Ordini dal tavolo + Stripe' },
  { ok: true, text: 'Analytics avanzate' },
  { ok: true, text: 'Nessun badge SmartMenu' },
];

const FAQS = [
  {
    q: "I clienti devono scaricare un'app?",
    a: "No. SmartMenu genera un link e un QR code. I clienti inquadrano il QR con la fotocamera del telefono e vedono il menù direttamente nel browser — nessuna installazione.",
  },
  {
    q: 'Come funziona la traduzione automatica?',
    a: "Con un click il menù viene tradotto in 10+ lingue — inglese, spagnolo, francese, tedesco, giapponese e altre. La funzione è inclusa nel piano Pro.",
  },
  {
    q: 'Posso aggiornare prezzi e piatti in qualsiasi momento?',
    a: 'Sì. Ogni modifica è visibile online in tempo reale. Non devi mai ristampare o rifare il QR code.',
  },
  {
    q: 'Come ricevo i pagamenti dagli ordini al tavolo?',
    a: "Tramite Stripe. Colleghi il tuo account Stripe dalla dashboard e i pagamenti (carta, Apple Pay, Google Pay) arrivano direttamente sul tuo conto.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span style={{ color: T.ambra, fontSize: 13, letterSpacing: 1 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile(768);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  return (
    <div style={{ minHeight: '100vh', background: T.crema, fontFamily: "var(--font-inter), 'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: `${T.espresso}f0`, backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/sm-logo.svg" alt="SmartMenu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: T.crema, letterSpacing: -0.3 }}>
            SmartMenu
          </span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {['Come funziona', 'Template', 'Prezzi', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{ fontSize: 13, fontWeight: 400, color: 'rgba(245,240,232,0.6)', textDecoration: 'none', transition: 'color .2s', padding: '12px 8px' }}
                onMouseEnter={e => e.target.style.color = T.crema}
                onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,0.6)'}
              >{item}</a>
            ))}
          </nav>
        )}

        {/* Desktop auth buttons */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {user ? (
              <Link href="/dashboard" style={{ fontSize: 13, color: T.crema, textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)', textDecoration: 'none' }}>Accedi</Link>
                <Link href="/login" style={{
                  fontSize: 13, fontWeight: 500, background: T.terracotta, color: T.crema,
                  padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                }}>Registrati gratis</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{
              background: 'none', border: 'none', color: T.crema,
              cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </header>

      {/* ── MOBILE MENU OVERLAY ──────────────────────────────────────── */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          background: T.espresso, zIndex: 49,
          display: 'flex', flexDirection: 'column',
          padding: '24px 24px 40px',
          animation: 'fadeSlideIn 0.25s ease forwards',
        }}>
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
            {['Come funziona', 'Template', 'Prezzi', 'FAQ'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: 18, fontWeight: 500, color: T.crema, textDecoration: 'none',
                  padding: '18px 0', borderBottom: '1px solid rgba(245,240,232,0.08)',
                  transition: 'color .2s',
                }}
              >{item}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{
                fontSize: 15, fontWeight: 600, background: T.terracotta, color: T.crema,
                padding: '14px 24px', borderRadius: 12, textDecoration: 'none', textAlign: 'center',
              }}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
                  fontSize: 15, fontWeight: 600, background: T.terracotta, color: T.crema,
                  padding: '14px 24px', borderRadius: 12, textDecoration: 'none', textAlign: 'center',
                }}>Registrati gratis</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
                  fontSize: 15, color: 'rgba(245,240,232,0.5)', textDecoration: 'none', textAlign: 'center',
                  padding: '10px 0',
                }}>Accedi</Link>
              </>
            )}
          </div>
        </div>
      )}

      <main>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{
          background: T.espresso, minHeight: '95vh', paddingTop: 128,
          paddingBottom: 96, position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative circles */}
          <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: T.terracotta, opacity: 0.06, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 320, height: 320, borderRadius: '50%', background: T.oliva, opacity: 0.08, pointerEvents: 'none' }} />

          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

            {/* badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(196,98,45,0.18)', border: '1px solid rgba(196,98,45,0.35)',
              color: T.ambra, fontSize: 12, fontWeight: 500, padding: '5px 14px',
              borderRadius: 20, marginBottom: 32,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.ambra, flexShrink: 0 }} />
              Usato da 500+ ristoranti italiani
            </div>

            {/* headline */}
            <h1 style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 'clamp(44px, 6vw, 80px)',
              fontWeight: 500, color: T.crema,
              lineHeight: 1.1, marginBottom: 24, maxWidth: 720,
              letterSpacing: -1,
            }}>
              Il tuo menù è il<br />
              primo{' '}
              <em style={{ color: T.terracotta, fontStyle: 'normal' }}>assaggio.</em>
              <br />
              Fallo valere.
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(245,240,232,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
              Scatta una foto al tuo menù cartaceo. L'AI lo trasforma in un menù digitale elegante in 2 minuti — QR code, traduzione automatica e allergeni inclusi.
            </p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 40, flexDirection: isMobile ? 'column' : 'row' }}>
              <Link href="/onboarding" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: T.terracotta, color: T.crema, fontWeight: 500,
                fontSize: 15, padding: '13px 28px', borderRadius: 10,
                textDecoration: 'none', transition: 'background .2s',
                width: isMobile ? '100%' : 'auto',
              }}>
                Crea il menù gratis <ArrowRight size={16} />
              </Link>
              <Link href="/preview" style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', textDecoration: 'none' }}>
                Guarda un esempio ↗
              </Link>
            </div>

            {/* checkmarks */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
              {['Nessuna app da scaricare', 'QR code incluso gratis', '10+ lingue automatiche', 'Allergeni generati in automatico', 'Pronto in 2 minuti'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(245,240,232,0.45)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.oliva, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>

          </div>

          {/* wave divider */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
            <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ height: 80, width: '100%', display: 'block' }}>
              <path d="M0 80 L1200 20 L1200 80 Z" fill={T.crema} />
            </svg>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <section style={{ background: T.crema, padding: '64px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
            {STATS.map(s => (
              <div key={s.n} style={{
                background: '#fff', border: '1px solid rgba(45,32,22,.08)',
                borderRadius: 16, padding: '28px 24px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 40, fontWeight: 500, color: T.espresso, marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: 'rgba(45,32,22,.5)', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COME FUNZIONA ───────────────────────────────────────────────── */}
        <section id="come-funziona" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.terracotta, marginBottom: 10 }}>Come funziona</div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: T.espresso, lineHeight: 1.2 }}>
                Dal menù cartaceo<br />al digitale in 3 passi
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  padding: '28px 0',
                  borderBottom: i < STEPS.length - 1 ? '1px solid rgba(45,32,22,.08)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: T.terracotta,
                    color: T.crema, fontSize: 14, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 500, color: T.espresso, marginBottom: 6 }}>{step.title}</div>
                    <div style={{ fontSize: 14, color: 'rgba(45,32,22,.55)', lineHeight: 1.65 }}>{step.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEMPLATE ────────────────────────────────────────────────────── */}
        <section id="template" style={{ background: T.crema, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.terracotta, marginBottom: 10 }}>Template</div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: T.espresso, lineHeight: 1.2 }}>
                Un design per ogni locale
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {TEMPLATES.map(tmpl => (
                <div key={tmpl.name} style={{ border: '1px solid rgba(45,32,22,.1)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                  <div style={{ height: 72, background: tmpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 13, color: tmpl.color, letterSpacing: 2, textTransform: 'uppercase' }}>{tmpl.name}</span>
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: T.espresso }}>{tmpl.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(45,32,22,.45)', marginTop: 2 }}>{tmpl.mood}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECENSIONI ──────────────────────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.terracotta, marginBottom: 10 }}>Ristoratori reali</div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: T.espresso }}>
                Chi usa SmartMenu ogni giorno
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {REVIEWS.map(r => (
                <div key={r.name} style={{ background: T.crema, border: '1px solid rgba(45,32,22,.08)', borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.bg, color: r.color, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.initials}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: T.espresso }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(45,32,22,.45)', lineHeight: 1.4 }}>{r.place}</div>
                    </div>
                    <Stars n={r.stars} />
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(45,32,22,.65)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PREZZI ──────────────────────────────────────────────────────── */}
        <section id="prezzi" style={{ background: T.crema, padding: '80px 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.terracotta, marginBottom: 10 }}>Prezzi</div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: T.espresso }}>
                Semplice. Senza sorprese.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              {/* Free */}
              <div style={{ background: '#fff', border: '1px solid rgba(45,32,22,.1)', borderRadius: 20, padding: 28 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: T.espresso, marginBottom: 4 }}>Gratis</div>
                <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 40, fontWeight: 500, color: T.espresso, marginBottom: 4 }}>
                  €0 <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(45,32,22,.4)' }}>/ sempre</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(45,32,22,.5)', marginBottom: 20, lineHeight: 1.5 }}>Per chi vuole provare senza impegno.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PLAN_FREE.map(f => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.ok ? T.oliva : 'rgba(45,32,22,.2)', marginTop: 6, flexShrink: 0 }} />
                      <span style={{ color: f.ok ? 'rgba(45,32,22,.75)' : 'rgba(45,32,22,.35)' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" style={{
                  display: 'block', marginTop: 24, textAlign: 'center',
                  border: '1.5px solid rgba(45,32,22,.2)', color: T.espresso,
                  padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none',
                }}>Inizia gratis</Link>
              </div>
              {/* Pro */}
              <div style={{ background: T.espresso, borderRadius: 20, padding: 28, border: `2px solid ${T.terracotta}` }}>
                <div style={{ display: 'inline-block', background: 'rgba(196,98,45,.25)', color: T.ambra, fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 20, marginBottom: 10 }}>Più scelto</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: T.crema, marginBottom: 4 }}>Pro</div>
                <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 40, fontWeight: 500, color: T.crema, marginBottom: 4 }}>
                  €19 <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(245,240,232,.4)' }}>/ mese</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(245,240,232,.5)', marginBottom: 20, lineHeight: 1.5 }}>Per fare bella figura ogni giorno.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PLAN_PRO.map(f => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.oliva, marginTop: 6, flexShrink: 0 }} />
                      <span style={{ color: 'rgba(245,240,232,.75)' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" style={{
                  display: 'block', marginTop: 24, textAlign: 'center',
                  background: T.terracotta, color: T.crema,
                  padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none',
                }}>Inizia Pro — €19/mese</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section id="faq" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.terracotta, marginBottom: 10 }}>FAQ</div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: T.espresso }}>Domande frequenti</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ padding: '20px 0', borderBottom: i < FAQS.length - 1 ? '1px solid rgba(45,32,22,.08)' : 'none' }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: T.espresso, marginBottom: 8 }}>{faq.q}</div>
                <div style={{ fontSize: 14, color: 'rgba(45,32,22,.6)', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINALE ──────────────────────────────────────────────────── */}
        <section style={{ background: T.espresso, padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: T.terracotta, opacity: 0.06, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 10, maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 44, fontWeight: 500, color: T.crema, lineHeight: 1.15, marginBottom: 16 }}>
              Il tuo ristorante<br />merita un menù all&apos;altezza.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(245,240,232,.45)', marginBottom: 36 }}>
              Gratis, pronto in 2 minuti. Nessuna carta di credito richiesta.
            </p>
            <Link href="/onboarding" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.terracotta, color: T.crema,
              fontSize: 15, fontWeight: 500, padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none',
            }}>
              Crea il menù adesso <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
