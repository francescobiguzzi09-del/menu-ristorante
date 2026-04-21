import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy — SmartMenu AI',
  description: 'Informativa sulla privacy di SmartMenu AI. Scopri come gestiamo e proteggiamo i tuoi dati personali.',
};

export default function Privacy() {
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
            display: 'inline-block', padding: '4px 12px', background: 'rgba(74,124,89,0.15)',
            color: '#4A7C59', fontWeight: 500, fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.1em', borderRadius: 20, marginBottom: 16,
          }}>Informativa &amp; Privacy</div>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: '#2D2016', marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)' }}>I tuoi dati sono al sicuro con noi.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', boxShadow: '0 4px 16px rgba(45,32,22,0.04)', border: '1px solid rgba(45,32,22,0.06)', color: '#2C2C2A', fontSize: 14, lineHeight: 1.7 }}>
          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8, marginTop: 0 }}>1. Quali dati raccogliamo</h3>
          <p style={{ marginBottom: 8, color: 'rgba(45,32,22,0.65)' }}>Durante l&apos;uso di SmartMenu AI raccogliamo varie categorie di informazioni:</p>
          <ul style={{ marginBottom: 24, paddingLeft: 20, color: 'rgba(45,32,22,0.65)' }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#2D2016' }}>Dati di Autenticazione:</strong> Il tuo indirizzo email per verificare la tua identità e creare la tua area riservata tramite Supabase.</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#2D2016' }}>Dati del Ristorante:</strong> Testi, categorie e descrizioni dei tuoi piatti e le impostazioni di branding necessarie per il menù digitale.</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#2D2016' }}>Immagini Analizzate:</strong> Le immagini sono elaborate dai provider per l&apos;estrazione del testo e non vengono conservate oltre il necessario.</li>
            <li><strong style={{ color: '#2D2016' }}>Dati di Pagamento:</strong> NON memorizziamo dati bancari. I pagamenti avvengono nell&apos;ambiente sicuro di <strong>Stripe Connect</strong>.</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>2. Come e dove usiamo le informazioni</h3>
          <p style={{ marginBottom: 8, color: 'rgba(45,32,22,0.65)' }}>Utilizziamo le tue informazioni esclusivamente per garantire l&apos;operatività del tuo menù e delle dashboard analitiche. Nessun dato è venduto a terzi.</p>
          <ul style={{ marginBottom: 24, paddingLeft: 20, color: 'rgba(45,32,22,0.65)' }}>
            <li style={{ marginBottom: 8 }}>I dati del menù in formato pubblico per i clienti che scansionano il QR Code.</li>
            <li>Le statistiche aggregate (tracking accessi) sui visualizzatori dei tuoi piatti.</li>
          </ul>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>3. Condivisione dei Dati e Terze Parti</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            SmartMenu AI può inviare temporaneamente testi e metadati ad API fornite da provider (OpenAI) per traduzioni e descrizioni IA. Questi provider operano come &quot;Data Processors&quot; con Zero Data Retention.
          </p>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>4. Cookie e Tecnologie di Tracciamento</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            SmartMenu AI utilizza solo cookie operativi indispensabili per le sessioni e i token OAuth. Nessun cookie di marketing di terze parti è utilizzato.
          </p>

          <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>5. Diritti Riguardanti I Propri Dati Personali</h3>
          <p style={{ marginBottom: 24, color: 'rgba(45,32,22,0.65)' }}>
            Hai il diritto (secondo GDPR) di cancellare in ogni istante i tuoi dati. Puoi farlo accedendo all&apos;area amministrativa o eliminando il tuo account personale.
          </p>

          <div style={{
            marginTop: 32, padding: 20, background: '#F5F0E8', borderRadius: 16,
            border: '1px solid rgba(45,32,22,0.06)', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#2D2016' }}>Richieste Privacy dedicate?</span>
            <a href="mailto:privacy@smartmenu.it" style={{
              fontSize: 13, fontWeight: 500, background: '#fff', border: '1px solid rgba(45,32,22,0.1)',
              color: '#2D2016', padding: '10px 20px', borderRadius: 12, textDecoration: 'none',
            }}>
              Contact DPO
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
