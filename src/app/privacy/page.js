import Head from 'next/head';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - SmartMenu AI</title>
      </Head>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        
        <header className="bg-slate-900 border-b border-slate-800 py-6 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
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
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest rounded-full mb-4">Informativa & Privacy</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-slate-500">I tuoi dati sono al sicuro con noi.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
            <h3>1. Quali dati raccogliamo</h3>
            <p>
              Durante l'uso di SmartMenu AI raccogliamo varie categorie di informazioni fondamentali per offrire il servizio:
            </p>
            <ul>
              <li><strong>Dati di Autenticazione:</strong> Quando ti registri, raccogliamo il tuo indirizzo email in modo da verificare la tua identità e creare la tua area riservata sicura tramite Supabase.</li>
              <li><strong>Dati del Ristorante (Menù):</strong> Testi, categorie e descrizioni dei tuoi piatti e le impostazioni di branding (nomi e link) necessarie per compilare e visualizzare il menù digitale che andrai a distribuire.</li>
              <li><strong>Immagini Analizzate:</strong> Le immagini della tua lavagna scattate in tempo reale sono elaborate dai nostri provider per l'estrazione intelligente del testo, e la loro conservazione non avverrà se non richiesto o per la durata necessaria all'estrazione mediante Intelligenza Artificiale (OpenAI/OpenRouter).</li>
              <li><strong>Dati di Pagamento:</strong> Noi NON ti richiediamo di memorizzare dati di pagamento bancari sui nostri server. Qualsiasi configurazione o accredito derivante dagli ordini digitali avviene all'interno dell'ambiente sicuro e crittografato di <strong>Stripe Connect</strong>.</li>
            </ul>

            <h3>2. Come e dove usiamo le informazioni</h3>
            <p>
              Utilizziamo le tue informazioni esclusivamente al fine di garantire l'operatività del tuo menu e delle dashboard analitiche. Nessun dato raccolto è venduto a soggetti terzi, partner o società di marketing senza il tuo espresso consenso esplicito. Usiamo:
            </p>
            <ul>
               <li>I dati del menu in formato pubblico affinchè i tuoi clienti loggandosi ai tavoli (via QR Code) possano vederlo sul dispositivo.</li>
               <li>Le statistiche analitizzate aggregate (tracking accessi) sui visualizzatori dei tuoi piatti.</li>
            </ul>

            <h3>3. Condivisione dei Dati e Terze Parti</h3>
            <p>
              SmartMenu AI può inviare temporaneamente testi e metadati ad API fornite da provider leader (OpenAI) per l'aggiunta di descrizioni IA o traduzioni AI generate automaticamente, ma questi sistemi terzi operano strettamente come "Data Processors" (Incaricati Temporanei), e si sono vincolati escludere l'utilizzo di quegli stessi per affinamento dei modelli (Zero Data Retention / Opt-out per API standard).
            </p>

            <h3>4. Cookie e Tecnologie di Tracciamento</h3>
            <p>
              SmartMenu AI utilizza limitatamente i cookie operativi (indispensabili) legati alle sessioni per ricordarsi delle identità e dei token OAuth temporanei del portale (log-in). Nessun pixel o cookie di marketing aggressivo di terzi è attualmente in grado di re-iniettare logiche commerciali nel menu degli utenti per finalità nostre (es. pubblicità invasive).
            </p>

            <h3>5. Diritti Riguardanti I Propri Dati Personali</h3>
            <p>
              Hai il diritto legale (secondo GDPR e direttive equiparate) di cancellare in ogni istante la quasi totalità dei tuoi dati. Semplicemente accedendo all'area amministrativa o eliminando completamente il tuo account personale dal database. 
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm font-bold text-slate-600">Richieste Privacy dedicate?</span>
              <a href="mailto:privacy@smartmenu.it" className="text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 px-5 py-2.5 rounded-xl shadow-sm transition-all hover:border-indigo-200">
                Contact DPO
              </a>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
