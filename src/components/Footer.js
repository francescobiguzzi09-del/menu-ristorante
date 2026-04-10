import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/sm-logo.png" alt="Smart Menu Logo" className="w-full h-full object-contain scale-[2.5]" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">SmartMenu</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Il modo più semplice per trasformare il tuo menù cartaceo in un'esperienza digitale interattiva utilizzando l'Intelligenza Artificiale.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Piattaforma</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Home Page</Link></li>
              <li><Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">La tua Dashboard</Link></li>
              <li><Link href="/admin" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Crea Nuovo Menù</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Risorse e Note legali</h3>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Domande Frequenti (FAQ)</Link></li>
              <li><Link href="/termini" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Termini di Servizio</Link></li>
              <li><Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Contatti</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Hai bisogno di assistenza o vuoi lasciarci un feedback per migliorare l'app?
            </p>
            <a 
              href="mailto:support@smartmenu.it"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Inviaci un'Email
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center sm:text-left">
            &copy; {new Date().getFullYear()} SmartMenu AI. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4">
             {/* Icone social opzionali */}
             <a href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
             </a>
             <a href="#" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
