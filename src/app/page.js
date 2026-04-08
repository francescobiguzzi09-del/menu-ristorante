"use client";

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { Star, CheckCircle, ArrowRight, Smartphone, Eye } from 'lucide-react';

const AnimatedCounter = ({ targetNumber, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * targetNumber));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [targetNumber, duration]);

  return <span>{count.toLocaleString('it-IT')}</span>;
}

const PhoneMockup = ({ children, className, bgClass = "bg-black" }) => (
  <div className={`relative w-[280px] h-[580px] rounded-[3rem] bg-[#2a2a2c] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 p-[8px] sm:p-[10px] flex-shrink-0 ${className}`}>
    
       {/* Inner Screen Bounds */}
       <div className="w-full h-full bg-[#000] rounded-[2.4rem] overflow-hidden relative ring-1 ring-white/5 isolate" style={{ transform: 'translateZ(0)' }}>
          
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-[#000] rounded-b-3xl w-28 mx-auto z-50"></div>
          
          {/* Screen Content */}
          <div className={`w-full h-full rounded-[2.4rem] absolute inset-0 overflow-y-auto overflow-x-hidden pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${bgClass}`}>
            {children}
          </div>

       </div>

    {/* Hardware Buttons in titanium (Z-index behind framework) */}
    <div className="absolute -left-[2px] top-32 w-[3px] h-8 bg-[#2a2a2c] rounded-l-md shadow-[-2px_0_4px_rgba(0,0,0,0.5)] -z-10"></div>
    <div className="absolute -left-[2px] top-44 w-[3.5px] h-12 bg-[#2a2a2c] rounded-l-md shadow-[-2px_0_4px_rgba(0,0,0,0.5)] -z-10"></div>
    <div className="absolute -left-[2px] top-[14.5rem] w-[3.5px] h-12 bg-[#2a2a2c] rounded-l-md shadow-[-2px_0_4px_rgba(0,0,0,0.5)] -z-10"></div>
    <div className="absolute -right-[2px] top-48 w-[3px] h-16 bg-[#2a2a2c] rounded-r-md shadow-[2px_0_4px_rgba(0,0,0,0.5)] -z-10"></div>
  </div>
);

export default function SaaSLanding() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden w-full selection:bg-indigo-500/30">
      
      {/* Top Navigation - Dark version */}
      <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        
        <div className="flex items-center gap-10 xl:gap-14">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <span className="font-black text-xl tracking-tight text-white hidden sm:block">
              SmartMenu <span className="text-indigo-400">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <span className="text-sm font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors tracking-wide">Funzionalità</span>
            <span className="text-sm font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors tracking-wide">Esempi</span>
            <span className="text-sm font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors tracking-wide">Prezzi</span>
            <span className="text-sm font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors tracking-wide">Chi Siamo</span>
          </nav>
        </div>

        <div className="flex gap-3 sm:gap-4 items-center">
          {user ? (
            <Link href="/dashboard" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block tracking-wide">Accedi</Link>
              <Link href="/login" className="text-sm font-bold bg-indigo-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-md">Registrati Gratis</Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full">
        
        {/* HERO SECTION (Dark / Indigo split) */}
        <section className="relative bg-slate-900 w-full min-h-[95vh] pt-32 pb-48 lg:pb-64 z-10">
          
          {/* Background decorations */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen"></div>
          
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center relative z-20">
            
            {/* Left Column (Copy) */}
            <div className="w-full lg:w-[45%] flex flex-col items-start text-left relative z-20 mt-10 md:mt-0 2xl:pl-10">
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-300 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full inline-flex items-center gap-2.5 mb-8 animate-in fade-in slide-in-from-bottom-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Il menù digitale del presente è qui
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] font-black text-white tracking-tight leading-[1.05] mb-6">
                Crea il tuo <br className="hidden md:block"/>Menù <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">Perfetto.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-10 font-medium leading-relaxed max-w-lg">
                Trasforma la foto del tuo vecchio menù cartaceo in un'esperienza digitale bellissima in 2 minuti. Ricco di funzioni per il tuo locale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
                <Link href="/admin" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-2xl text-lg transition-all shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center gap-3">
                  Crea Subito Il Menù
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Feature Checklist (Dark Mode) */}
              <div className="flex flex-col gap-3 mt-4 text-slate-300 text-sm font-semibold">
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-teal-400"/> Traduzione istantanea in 10+ lingue</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-teal-400"/> Badge allergeni generati in automatico</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-teal-400"/> Generazione Grafica basata sull'AI</div>
              </div>

            </div>

            {/* Right Column (Phones Mockup) */}
            <div className="w-full lg:w-[55%] mt-20 lg:mt-10 relative lg:h-[600px] h-[500px] flex items-center justify-center pointer-events-none">
               
               <div className="relative w-full max-w-[800px] h-full flex items-center justify-center lg:absolute lg:right-[-10%] xl:right-[-20%] lg:top-1/2 lg:-translate-y-1/2 overflow-visible">
                 
                 {/* Phone 1: Rotated Back (Cinematic Menu) */}
                 <div className="absolute transform -rotate-12 -translate-x-[4.5rem] sm:-translate-x-44 translate-y-8 sm:translate-y-12 opacity-95 hover:opacity-100 hover:rotate-0 hover:z-30 transition-all duration-500 pointer-events-auto">
                   <PhoneMockup className="sm:scale-95 scale-[0.80] origin-center shadow-2xl shadow-black/40" bgClass="bg-slate-950">
                      <div className="min-h-fit h-full p-4 font-sans text-slate-200">
                         {/* Cinematic Header */}
                         <div className="text-center font-black text-2xl uppercase tracking-[0.2em] mt-8 mb-5 text-white drop-shadow-xl">LOUNGE VIP</div>
                         <div className="h-[1px] w-12 mx-auto bg-amber-500/30 mb-6"></div>
                         
                         {/* Cinematic Items */}
                         <div className="space-y-4 pb-10">
                           {[1,2,3,4].map(idx => (
                             <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-3">
                               <div className="w-12 h-12 shrink-0 rounded-lg bg-black border border-white/5"></div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start gap-2 mb-1">
                                   <div className="text-white font-bold text-[13px] truncate">Martini Gold</div>
                                   <div className="text-amber-400 font-bold text-[13px]">€14</div>
                                 </div>
                                 <div className="text-[10px] text-slate-400 leading-tight">Gin, Vermouth, Foglia d'oro</div>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                   </PhoneMockup>
                 </div>

                 {/* Phone 3: Rotated Forward (Modern Menu) */}
                 <div className="absolute transform rotate-12 translate-x-[4.5rem] sm:translate-x-40 translate-y-12 sm:translate-y-16 opacity-95 hover:opacity-100 hover:rotate-0 hover:z-30 transition-all duration-500 hidden sm:block pointer-events-auto">
                   <PhoneMockup className="scale-95 origin-center shadow-2xl shadow-black/40" bgClass="bg-[#f8f9fa]">
                      <div className="min-h-fit h-full font-sans text-slate-900 pb-10">
                         {/* Modern Elegant Header */}
                         <div className="bg-white p-6 shadow-sm border-b border-slate-100 text-center mb-6 rounded-b-[2rem]">
                            <div className="font-bold text-xl uppercase tracking-wider text-slate-900">Brunch Café</div>
                            <div className="text-[10px] uppercase tracking-widest text-emerald-600 mt-1 font-bold">Healthy & Organic</div>
                         </div>

                         {/* Modern Items */}
                         <div className="px-4 space-y-4">
                           <div className="font-black text-[11px] text-slate-400 uppercase tracking-widest pl-1 mb-2">Pancakes</div>
                           {[1,2,3].map(idx => (
                             <div key={idx} className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-50 flex flex-col justify-center">
                               <div className="flex justify-between items-center">
                                 <div>
                                   <div className="font-bold text-slate-800 text-[13px]">Avocado Toast</div>
                                   <div className="text-[11px] text-slate-500 mt-0.5">Uovo in camicia, lime</div>
                                 </div>
                                 <div className="font-bold text-emerald-600 text-[14px]">€12</div>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                   </PhoneMockup>
                 </div>

                 {/* Phone 2: Main Center (Elegant Menu - #0a0a0b background) */}
                 <div className="relative z-20 transform scale-[0.9] sm:scale-100 lg:scale-[1.05] xl:scale-[1.1] hover:scale-[1.1] xl:hover:scale-[1.15] transition-transform duration-500 pointer-events-auto">
                   <PhoneMockup className="shadow-2xl shadow-black/50 border-black" bgClass="bg-[#0a0a0b]">
                      
                      <div className="min-h-fit h-full p-5 pt-12 font-serif text-[#e0dfdc] relative">
                         {/* Subdued glow */}
                         <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full bg-[#c9a66b] blur-[80px] opacity-10 pointer-events-none"></div>

                         <div className="w-10 h-[1px] bg-[#c9a66b] mx-auto mt-2 mb-4"></div>
                         <div className="text-center font-light text-3xl text-white mb-2">La Taverna</div>
                         <div className="text-center text-[9px] text-[#a19f9b] uppercase tracking-[0.3em] mb-4">Dal 1956</div>
                         <div className="w-10 h-[1px] bg-[#c9a66b] mx-auto mb-8"></div>
                         
                         <div className="space-y-6 pb-10">
                           <div className="flex items-center gap-2 mb-4 justify-center">
                              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#333]"></div>
                              <span className="text-center text-[12px] text-[#c9a66b] tracking-widest uppercase">I Primi Piatti</span>
                              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#333]"></div>
                           </div>
                           
                           {[1,2,3,4,5].map(idx => (
                             <div key={idx} className="flex flex-col mb-4 px-1">
                               <div className="flex justify-between items-baseline mb-1">
                                 <span className="font-bold text-white text-[13px] tracking-wide">Carbonara</span>
                                 <span className="border-b border-dotted border-[#444] flex-1 mx-2"></span>
                                 <span className="font-bold text-[#c9a66b] text-[13px]">€16</span>
                               </div>
                               <div className="text-[10px] text-[#8e8d89] font-sans font-light leading-relaxed truncate">Guanciale di Norcia, Pecorino, Pepe Nero</div>
                             </div>
                           ))}
                         </div>
                      </div>

                   </PhoneMockup>
                 </div>
                 
               </div>
            </div>

          </div>

          {/* SVG Shape bottom divider - Matches Tailwind bg-slate-50 */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-[50px] sm:h-[90px] lg:h-[130px] w-full block">
                <path d="M0 120L1200 0 1200 120z" className="fill-slate-50"></path>
            </svg>
          </div>
        </section>

        {/* SOCIAL PROOF SECTION - FULL WIDTH IMPACT */}
        <section className="bg-slate-50 w-full pt-8 pb-32">
          <div className="max-w-[1200px] mx-auto px-6 relative z-30">
            {/* The white elevated box overlapping the bottom of the hero slightly */}
            <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 lg:p-16 border border-slate-100/50 flex flex-col md:flex-row justify-between items-center gap-12 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 transform -translate-y-6 sm:-translate-y-12">
               
               {/* Stat 1 */}
               <div className="flex-1 flex flex-col items-center pt-4 md:pt-0 w-full">
                   <div className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter"><AnimatedCounter targetNumber={524} /></div>
                   <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-500" />
                      Menù Digitali Creati
                   </div>
               </div>

               {/* Stat 2 (Main Rating) */}
               <div className="flex-1 flex flex-col items-center pt-10 md:pt-0 w-full">
                   <div className="flex gap-1.5 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400 text-amber-400" />)}
                   </div>
                   <div className="font-black text-xl text-slate-900 mb-1">SmartMenu AI</div>
                   <div className="text-sm font-bold text-slate-500">Punteggio Interno <span className="text-slate-900">4.9/5</span></div>
               </div>

               {/* Stat 3 */}
               <div className="flex-1 flex flex-col items-center pt-10 md:pt-0 w-full">
                   <div className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter">1.5M<span className="text-indigo-500">+</span></div>
                   <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-500" />
                      Visualizzazioni Mensili
                   </div>
               </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
