import Link from 'next/link';
import Footer from '@/components/Footer';
import { QrCode } from 'lucide-react';

export const metadata = {
  title: 'Domande Frequenti — SmartMenu AI',
  description: 'Risposte alle domande più comuni su SmartMenu AI: come funziona, traduzione automatica, QR code, pagamenti e molto altro.',
};

export default function FAQ() {
  const faqs = [
    {
      q: "Come funziona SmartMenu AI?",
      a: "Basta scattare una foto al tuo menù cartaceo o alla lavagna. La nostra Intelligenza Artificiale riconoscerà automaticamente i piatti, i prezzi e le categorie, costruendo un menù digitale elegante e interattivo in meno di 2 minuti."
    },
    {
      q: "I clienti devono scaricare un'app?",
      a: "No, assolutamente. SmartMenu AI genera un semplice link (e un QR Code). I tuoi clienti dovranno solo inquadrare il QR Code con la fotocamera del loro telefono per sfogliare il menù direttamente dal browser."
    },
    {
      q: "Posso tradurre il menù in altre lingue?",
      a: "Sì! Grazie alla funzione 'Traduzione IA' integrata (Premium), puoi tradurre automaticamente l'intero menù (nomi dei piatti, descrizioni e categorie) in Inglese, Spagnolo, Francese e Tedesco con un solo click."
    },
    {
      q: "Come ricevo i pagamenti se abilito gli ordini dal tavolo?",
      a: "Utilizziamo Stripe. Collegando o creando un account Stripe direttamente dalla tua Dashboard, i pagamenti effettuati dai clienti (tramite Carta, Apple Pay o Google Pay) verranno accreditati automaticamente e in modo sicuro sul tuo conto bancario."
    },
    {
      q: "Cosa succede se cambio un prezzo o aggiungo un piatto?",
      a: "Puoi aggiornare il menù in qualsiasi momento dal tuo pannello di amministrazione. Una volta cliccato su 'Crea Menù' (o 'Salva'), le modifiche saranno immediatamente visibili online a chiunque visiti il link o scansioni il QR Code. Non dovrai mai ristampare o rifare il QR Code!"
    },
    {
      q: "Posso far sì che il menù non mostri il marchio SmartMenu AI?",
      a: "Certamente. Esiste un'opzione 'White-Label' nel pannello delle impostazioni che ti consente di rimuovere il badge 'Powered by SmartMenu AI', lasciando ai tuoi clienti un'esperienza personalizzata e focalizzata al 100% sul tuo brand."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', fontFamily: "var(--font-inter), 'Inter', sans-serif" }}>

      {/* Header */}
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
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(245,240,232,0.6)', textDecoration: 'none', transition: 'color .2s' }}>
            Torna alla Dashboard
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '64px 24px', width: '100%' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px', background: 'rgba(232,168,74,0.2)',
            color: '#C4622D', fontWeight: 500, fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.1em', borderRadius: 20, marginBottom: 16,
          }}>Supporto</div>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: '#2D2016', marginBottom: 12 }}>Domande Frequenti</h1>
          <p style={{ fontSize: 16, color: 'rgba(45,32,22,0.5)' }}>Tutto quello che c&apos;è da sapere su SmartMenu AI.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '32px', boxShadow: '0 4px 16px rgba(45,32,22,0.04)', border: '1px solid rgba(45,32,22,0.06)' }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{ padding: '24px 0', borderBottom: index < faqs.length - 1 ? '1px solid rgba(45,32,22,0.06)' : 'none' }}>
              <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#2D2016', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ color: '#C4622D', flexShrink: 0, marginTop: 1 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </span>
                {faq.q}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.6)', lineHeight: 1.7, paddingLeft: 32 }}>
                {faq.a}
              </p>
            </div>
          ))}

          <div style={{
            marginTop: 40, padding: 28, background: 'rgba(196,98,45,0.06)',
            borderRadius: 16, border: '1px solid rgba(196,98,45,0.1)', textAlign: 'center',
          }}>
            <div style={{ width: 48, height: 48, background: 'rgba(196,98,45,0.1)', color: '#C4622D', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><polyline points="15,9 18,9 18,11"/><path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0"/></svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-display), serif', fontSize: 17, fontWeight: 500, color: '#2D2016', marginBottom: 8 }}>Non hai trovato la risposta?</h4>
            <p style={{ fontSize: 13, color: 'rgba(45,32,22,0.5)', marginBottom: 20 }}>Il nostro team è pronto ad aiutarti per qualsiasi dubbio o problema tecnico.</p>
            <a href="mailto:support@smartmenu.it" style={{
              display: 'inline-flex', background: '#C4622D', color: '#F5F0E8',
              fontWeight: 500, padding: '12px 24px', borderRadius: 12, fontSize: 14,
              textDecoration: 'none', transition: 'opacity .2s',
            }}>
              Contatta il Supporto
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
