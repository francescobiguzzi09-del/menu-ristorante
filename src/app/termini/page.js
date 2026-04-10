import Head from 'next/head';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Termini() {
  return (
    <>
      <Head>
        <title>Termini di Servizio - SmartMenu AI</title>
      </Head>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        
        <header className="bg-slate-900 border-b border-slate-800 py-6 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/sm-logo.png" alt="Smart Menu Logo" className="w-full h-full object-contain scale-[2.5]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">SmartMenu</span>
            </Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Torna alla Dashboard
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full prose prose-slate prose-indigo">
          <div className="mb-12">
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-widest rounded-full mb-4">Note Legali</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Termini di Servizio</h1>
            <p className="text-slate-500">Ultimo aggiornamento: Ottobre 2023</p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
            <h3>1. Accettazione dei Termini</h3>
            <p>
              Utilizzando SmartMenu AI ("il Servizio"), accetti di essere vincolato dai presenti Termini di Servizio. Se non accetti queste condizioni, ti preghiamo di non utilizzare la piattaforma.
            </p>

            <h3>2. Descrizione del Servizio</h3>
            <p>
              SmartMenu AI è una piattaforma che consente ai ristoratori di digitalizzare i propri menù cartacei o scritti su lavagna tramite l'uso dell'Intelligenza Artificiale, generare QR code per l'accesso dei clienti, e opzionalmente ricevere pagamenti digitali.
            </p>

            <h3>3. Servizi di Terze Parti Utilizzati</h3>
            <p>
              Per garantire le funzionalità descritte, SmartMenu AI si appoggia ai seguenti servizi di terze parti:
            </p>
            <ul>
              <li><strong>Stripe:</strong> Utilizzato per l'elaborazione dei pagamenti. Quando configuri gli ordini dal tavolo, i fondi vengono gestiti e processati direttamente tramite Stripe Connect. Sei soggetto ai Termini di Servizio di Stripe.</li>
              <li><strong>OpenAI / OpenRouter:</strong> Utilizzati per le funzionalità di Intelligenza Artificiale (estrazione testo da immagini, generazione descrizioni e traduzioni multilingua). Le immagini dei tuoi menù e i testi generati vengono inviati a questi provider nel rispetto delle loro politiche di elaborazione dati.</li>
              <li><strong>Supabase:</strong> Utilizzato per l'infrastruttura di database e l'autenticazione degli utenti.</li>
            </ul>

            <h3>4. Account, Responsabilità e Uso Consentito</h3>
            <p>
              Il ristoratore è responsabile di mantenere la riservatezza delle proprie credenziali di accesso. Sei l'unico responsabile per la veridicità dei prezzi, degli allergeni indicati e delle informazioni sui piatti pubblicate nel tuo menù digitale.
            </p>
            <p className="mt-2 font-semibold text-rose-600">
              È severamente vietato utilizzare SmartMenu AI per pubblicare o condividere contenuti illeciti, offensivi, discriminatori, osceni o in violazione delle leggi vigenti. L'uso della piattaforma per fini illegali o per la diffusione di materiale inappropriato comporterà la sospensione immediata o il ban permanente dell'account.
            </p>

            <h3>5. Modifiche al Servizio</h3>
            <p>
              Ci riserviamo il diritto di modificare o interrompere, temporaneamente o permanentemente, il Servizio (o qualsiasi sua parte) con o senza preavviso. I prezzi dei piani e le funzionalità Premium possono essere soggetti a modifiche.
            </p>

            <h3>6. Limitazione di Responsabilità</h3>
            <p>
              SmartMenu AI fornisce il servizio "così com'è". Non siamo responsabili per mancanze di guadagno derivanti da disservizi temporanei, per inesattezze nelle traduzioni o nelle elaborazioni IA dei menù. Il ristoratore è tenuto a revisionare sempre le generazioni IA prima di pubblicarle definitivamente.
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm font-bold text-slate-600">Hai domande sui Termini?</span>
              <a href="mailto:support@smartmenu.it" className="text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 px-5 py-2.5 rounded-xl shadow-sm transition-all hover:border-indigo-200">
                Contattaci
              </a>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
