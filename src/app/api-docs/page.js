import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 flex flex-col">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/sm-logo.svg" alt="Smart Menu Logo" className="w-full h-full object-contain " />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">API Reference</h1>
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
            Torna alla Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">SmartMenu API Documentation</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Interagisci programmaticamente con i tuoi menù digitali. Usa le nostre REST API per recuperare i piatti, integrarli nel tuo sito web o aggiornarli dal tuo gestionale di cassa.
          </p>
        </div>

        <div className="space-y-12">
          {/* GET /api/menu */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6">
              <span className="font-mono text-xs font-bold text-white bg-blue-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">GET</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Recupera Menù</h2>
            <div className="flex items-center gap-2 mb-6 text-sm font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl overflow-x-auto">
              <span className="text-blue-500 font-bold">GET</span>
              <span className="text-slate-900 dark:text-slate-300 select-all">https://smartmenu.ai/api/menu?restaurantId=&#123;ID&#125;</span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Recupera l'intero file JSON contenente le impostazioni del ristorante, lo stile e l'intero array dei prodotti inseriti. Ottimo per visualizzare il menù all'interno di app terze.
            </p>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Parametri Query</h4>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Parametro</th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Tipo</th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Descrizione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-400">
                  <tr>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">restaurantId</td>
                    <td className="px-4 py-3 font-mono text-xs">string</td>
                    <td className="px-4 py-3">L'ID univoco del tuo ristorante (visibile in Dashboard). <span className="text-rose-500 font-bold ml-1">Obbligatorio</span>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Esempio Risposta (200 OK)</h4>
            <pre className="bg-slate-950 text-slate-300 p-4 sm:p-6 rounded-2xl text-xs sm:text-sm overflow-x-auto border border-slate-800 font-mono leading-relaxed select-all">
{`{
  "settings": {
    "restaurantName": "L'Essenza",
    "currency": "EUR"
  },
  "menu": [
    {
      "id": "item-12345",
      "name": "Pizza Margherita",
      "category": "Pizze",
      "price": "8.50"
    }
  ]
}`}
            </pre>
          </section>

          {/* POST /api/menu */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-6">
              <span className="font-mono text-xs font-bold text-white bg-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">POST</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Crea o Aggiorna Menù</h2>
            <div className="flex items-center gap-2 mb-6 text-sm font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl overflow-x-auto">
              <span className="text-emerald-500 font-bold">POST</span>
              <span className="text-slate-900 dark:text-slate-300 select-all">https://smartmenu.ai/api/menu</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Utile per sincronizzare il tuo gestionale di cassa locale con il menù digitale su SmartMenu AI. Carica un payload JSON completo per sovrascrivere o creare i dati.
            </p>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Body (JSON)</h4>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Parametro</th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Tipo</th>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Descrizione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-400">
                  <tr>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">restaurantId</td>
                    <td className="px-4 py-3 font-mono text-xs">string</td>
                    <td className="px-4 py-3">ID univoco. Usalo per sovrascrivere o crea un nuovo ID.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">data</td>
                    <td className="px-4 py-3 font-mono text-xs">object</td>
                    <td className="px-4 py-3">L'oggetto contenente "menu", "settings", ecc.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">userId</td>
                    <td className="px-4 py-3 font-mono text-xs">string</td>
                    <td className="px-4 py-3">L'ID del tuo account utente (UUID di Supabase).</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Esempio Risposta (200 OK)</h4>
            <pre className="bg-slate-950 text-slate-300 p-4 sm:p-6 rounded-2xl text-xs sm:text-sm overflow-x-auto border border-slate-800 font-mono leading-relaxed select-all">
{`{
  "success": true,
  "message": "Menù salvato con successo su Supabase!"
}`}
            </pre>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
