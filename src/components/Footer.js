"use client";

import Link from 'next/link';
import { QrCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#2D2016', borderTop: '1px solid rgba(245,240,232,0.08)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#C4622D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <QrCode size={18} color="#F5F0E8" />
              </div>
              <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#F5F0E8', letterSpacing: -0.3 }}>
                SmartMenu
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.6, maxWidth: 220 }}>
              Il modo più semplice per creare un menù digitale con QR code. Scatta, pubblica, condividi.
            </p>
          </div>

          {/* Piattaforma */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 16 }}>Piattaforma</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link href="/" style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='#C4622D'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.55)'}>Home Page</Link></li>
              <li><Link href="/dashboard" style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='#C4622D'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.55)'}>La tua Dashboard</Link></li>
              <li><Link href="/admin" style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='#C4622D'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.55)'}>Crea Nuovo Menù</Link></li>
            </ul>
          </div>

          {/* Risorse */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 16 }}>Risorse e Note legali</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link href="/faq" style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='#C4622D'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.55)'}>Domande Frequenti (FAQ)</Link></li>
              <li><Link href="/termini" style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='#C4622D'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.55)'}>Termini di Servizio</Link></li>
              <li><Link href="/privacy" style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color='#C4622D'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.55)'}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 16 }}>Contatti</h3>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', marginBottom: 16, lineHeight: 1.5 }}>
              Hai bisogno di assistenza o vuoi lasciarci un feedback?
            </p>
            <a
              href="mailto:support@smartmenu.it"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#C4622D', color: '#F5F0E8', fontWeight: 500,
                padding: '10px 16px', borderRadius: 10, fontSize: 13,
                textDecoration: 'none', transition: 'opacity .2s', width: '100%',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Inviaci un&apos;Email
            </a>
          </div>
        </div>

        <div style={{
          marginTop: 40, paddingTop: 24,
          borderTop: '1px solid rgba(245,240,232,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)' }}>
            © {new Date().getFullYear()} SmartMenu AI. Tutti i diritti riservati.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="#" style={{
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,240,232,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(245,240,232,0.35)', transition: 'all .2s', textDecoration: 'none',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" style={{
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,240,232,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(245,240,232,0.35)', transition: 'all .2s', textDecoration: 'none',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
