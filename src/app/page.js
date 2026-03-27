"use client";

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function SaaSLanding() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push('/dashboard');
      }
      setUser(session?.user || null);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans bg-grid-slate-100 relative w-full">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full pt-20">
        
        {/* Top Navigation */}
        <div className="absolute top-0 w-full p-6 flex justify-end z-10 max-w-5xl mx-auto left-1/2 -translate-x-1/2">
          {user ? (
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Torna alla Dashboard</Link>
          ) : (
            <div className="flex gap-4 items-center">
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Accedi</Link>
              <Link href="/login" className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition-all shadow-md">Registrati</Link>
            </div>
          )}
        </div>

        <div className="max-w-3xl bg-white p-10 sm:p-16 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden mt-12 w-full mb-16">
          
          {/* Decorative elements */}
          <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-gradient-to-tl from-teal-500/10 to-sky-600/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6">SmartMenu AI</h1>
            <p className="text-xl text-slate-500 mb-10 font-medium leading-relaxed max-w-xl mx-auto">
              La piattaforma definitiva per creare, gestire e condividere il menù del tuo ristorante ovunque, in 2 minuti grazie all'intelligenza artificiale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl text-lg transition-all shadow-md group flex items-center justify-center gap-2">
                Vai alla tua Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            
            <div className="mt-14 pt-10 border-t border-slate-100 flex items-center justify-center gap-8 text-slate-400 font-semibold text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">1</span>
                <span>Carica la foto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">2</span>
                <span>L'AI genera il menù</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500">3</span>
                <span className="text-slate-600">Condividi ovunque</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
