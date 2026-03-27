import Head from 'next/head';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function FAQ() {
  const faqs = [
    {
      q: "Come fuziona SmartMenu AI?",
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
    <>
      <Head>
        <title>Domande Frequenti - SmartMenu AI</title>
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

        <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
          <div className="mb-12">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs uppercase tracking-widest rounded-full mb-4">Supporto</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Domande Frequenti</h1>
            <p className="text-slate-500 text-lg">Tutto quello che c'è da sapere su SmartMenu AI.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-slate-100 last:border-0 pb-8 last:pb-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                    <span className="text-indigo-500 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                    </span>
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 leading-relaxed pl-9">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><polyline points="15,9 18,9 18,11"/><path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0"/></svg>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Non hai trovato la risposta?</h4>
              <p className="text-slate-500 mb-6 text-sm">Il nostro team è pronto ad aiutarti per qualsiasi dubbio o problema tecnico.</p>
              <a href="mailto:support@smartmenu.it" className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors">
                Contatta il Supporto
              </a>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
