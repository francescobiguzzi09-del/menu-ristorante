import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Termini di Servizio — SmartMenu AI',
  description: 'Termini e condizioni d\'uso della piattaforma SmartMenu AI per la creazione di menù digitali per ristoranti.',
};

export default function Termini() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', fontFamily: "var(--font-inter), 'Inter', sans-serif" }}>

      <header style={{
        background: '#2D2016', borderBottom: '1px solid rgba(245,240,232,0.08)',
        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/sm-logo.png" alt="SmartMenu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(2.5)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#F5F0E8', letterSpacing: -0.3 }}>SmartMenu</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(245,240,232,0.6)', textDecoration: 'none' }}>
            Torna alla Dashboard
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '64px 24px', width: '100%' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px', background: 'rgba(196,98,45,0.15)',
            color: '#C4622D', fontWeight: 500, fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.1em', borderRadius: 20, marginBottom: 16,
          }}>Note Legali</div>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: '#2D2016', marginBottom: 12 }}>Termini di Servizio</h1>
          <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)' }}>Ultimo aggiornamento: Ottobre 2023</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', boxShadow: '0 4px 16px rgba(45,32,22,0.04)', border: '1px solid rgba(45,32,22,0.06)', color: '#2C2C2A', fontSize: 14, lineHeight: 1.7 }}>
          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8, marginTop: 0 }}>1. Accettazione dei Termini</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            Utilizzando SmartMenu AI (&quot;il Servizio&quot;), accetti di essere vincolato dai presenti Termini di Servizio. Se non accetti queste condizioni, ti preghiamo di non utilizzare la piattaforma.
          </p>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>2. Descrizione del Servizio</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            SmartMenu AI è una piattaforma che consente ai ristoratori di digitalizzare i propri menù cartacei o scritti su lavagna tramite l&apos;uso dell&apos;Intelligenza Artificiale, generare QR code per l&apos;accesso dei clienti, e opzionalmente ricevere pagamenti digitali.
          </p>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>3. Servizi di Terze Parti Utilizzati</h3>
          <p style={{ marginBottom: 8, color: 'rgba(45,32,22,0.65)' }}>Per garantire le funzionalità descritte, SmartMenu AI si appoggia ai seguenti servizi di terze parti:</p>
          <ul style={{ marginBottom: 24, paddingLeft: 20, color: 'rgba(45,32,22,0.65)' }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#2D2016' }}>Stripe:</strong> Utilizzato per l&apos;elaborazione dei pagamenti. Quando configuri gli ordini dal tavolo, i fondi vengono gestiti e processati direttamente tramite Stripe Connect.</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#2D2016' }}>OpenAI / OpenRouter:</strong> Utilizzati per le funzionalità di Intelligenza Artificiale (estrazione testo da immagini, generazione descrizioni e traduzioni multilingua).</li>
            <li><strong style={{ color: '#2D2016' }}>Supabase:</strong> Utilizzato per l&apos;infrastruttura di database e l&apos;autenticazione degli utenti.</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>4. Account, Responsabilità e Uso Consentito</h3>
          <p style={{ marginBottom: 8, color: 'rgba(45,32,22,0.65)' }}>
            Il ristoratore è responsabile di mantenere la riservatezza delle proprie credenziali di accesso. Sei l&apos;unico responsabile per la veridicità dei prezzi, degli allergeni indicati e delle informazioni sui piatti pubblicati nel tuo menù digitale.
          </p>
          <p style={{ marginBottom: 24, fontWeight: 600, color: '#dc2626' }}>
            È severamente vietato utilizzare SmartMenu AI per pubblicare o condividere contenuti illeciti, offensivi, discriminatori, osceni o in violazione delle leggi vigenti. L&apos;uso della piattaforma per fini illegali comporterà la sospensione immediata o il ban permanente dell&apos;account.
          </p>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>5. Modifiche al Servizio</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            Ci riserviamo il diritto di modificare o interrompere, temporaneamente o permanentemente, il Servizio (o qualsiasi sua parte) con o senza preavviso.
          </p>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>6. Limitazione di Responsabilità</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            SmartMenu AI fornisce il servizio &quot;così com&apos;è&quot;. Non siamo responsabili per mancanze di guadagno derivanti da disservizi temporanei, per inesattezze nelle traduzioni o nelle elaborazioni IA dei menù. Il ristoratore è tenuto a revisionare sempre le generazioni IA.
          </p>

          <div style={{
            marginTop: 32, padding: 20, background: '#F5F0E8', borderRadius: 16,
            border: '1px solid rgba(45,32,22,0.06)', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#2D2016' }}>Hai domande sui Termini?</span>
            <a href="mailto:support@smartmenu.it" style={{
              fontSize: 13, fontWeight: 500, background: '#fff', border: '1px solid rgba(45,32,22,0.1)',
              color: '#2D2016', padding: '10px 20px', borderRadius: 12, textDecoration: 'none',
              transition: 'all .2s',
            }}>
              Contattaci
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
