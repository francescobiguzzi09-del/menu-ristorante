"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

export default function OnboardingWizard() {
  const router = useRouter();
  const toast = useToast();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  
  // Data State
  const [restaurantName, setRestaurantName] = useState('');
  const [useAI, setUseAI] = useState(null);
  const [aiItems, setAiItems] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [template, setTemplate] = useState('modern');
  const [createdMenuId, setCreatedMenuId] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Check Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });
  }, [router]);

  const handleNext = () => {
    setDirection('forward');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection('backward');
    setStep((prev) => prev - 1);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleAiUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsAiLoading(true);
    
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;

      const res = await fetch('/api/parse-menu', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      const data = await res.json();
      if (data.success && data.data) {
        setAiItems(data.data);
        handleNext(); // Procedi se successo
      } else {
        toast.error(data.error || "Errore durante l'analisi IA dell'immagine.", 'Errore IA');
      }
    } catch (err) {
      toast.error('Errore di connessione al server IA.', 'Errore');
      console.error(err);
    } finally {
      setIsAiLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const finishOnboarding = async () => {
    setIsSaving(true);
    try {
      // 1. Generate new ID
      const newId = 'menu-' + Math.random().toString(36).substr(2, 9);
      
      // 2. Prepare Settings
      const newSettings = {
        restaurantName: restaurantName || "Mio Ristorante",
        template: template || "modern",
        whiteLabel: false,
        enableOrdering: false,
        currency: "€"
      };

      // 3. Save to DB
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: newId,
          data: { 
            settings: newSettings, 
            menu: aiItems 
          },
          userId: user.id
        })
      });

      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error);
      
      // 4. Redirect with Magic!
      setCreatedMenuId(newId);
      setStep(4);
      setTimeout(() => {
        router.push(`/admin?id=${newId}`);
      }, 7000);

    } catch (err) {
      toast.error('Errore durante la creazione del menù: ' + err.message, 'Errore');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div></div>;
  }

  // Animation classes
  const animationIn = "animate-in slide-in-from-bottom-8 slide-in-from-right-4 fade-in duration-700 ease-out fill-mode-forwards";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10 w-full min-h-[400px] flex flex-col">
        
        {/* Header Progress */}
        {step < 4 && (
           <div className="w-full flex justify-between items-center mb-12">
             <button onClick={() => step === 1 ? router.push('/dashboard') : handleBack()} className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {step === 1 ? "Torna al menu principale" : "Torna Indietro"}
             </button>
             <div className="flex gap-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${step === i ? 'bg-indigo-500 w-8' : step > i ? 'bg-indigo-500/50' : 'bg-slate-800'}`}></div>
               ))}
             </div>
           </div>
        )}

        {/* --- STEP 1: RESTAURANT NAME --- */}
        {step === 1 && (
          <div key="step1" className={`flex flex-col flex-1 justify-center ${animationIn}`}>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Iniziamo dal nome.</h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg">Iniziamo dalle basi. In quale locale stiamo per fare la magia?</p>
            
            <div className="space-y-6 max-w-md">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-widest">Nome Ristorante</label>
                <input 
                  type="text" 
                  autoFocus
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="es. Pizzeria da Mario"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-2xl px-6 py-4 text-xl font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder-slate-600"
                  onKeyDown={(e) => e.key === 'Enter' && restaurantName && handleNext()}
                />
              </div>
              <button 
                disabled={!restaurantName.trim()}
                onClick={handleNext} 
                className="w-full bg-white text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 font-black px-6 py-4 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 text-lg"
              >
                Continua
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: AI IMPORT --- */}
        {step === 2 && (
          <div key="step2" className={`flex flex-col flex-1 justify-center ${animationIn}`}>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Scegli come iniziare.</h1>
            <p className="text-lg text-slate-400 mb-10">Carica una foto del tuo menù cartaceo e la nostra IA estrarrà piatti e prezzi in 10 secondi. Oppure fai tutto manualmente.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option AI */}
              <button 
                onClick={() => { setUseAI(true); triggerFileInput(); }}
                disabled={isAiLoading}
                className="group relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500/30 hover:border-indigo-400 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] overflow-hidden"
              >
                {isAiLoading && (
                   <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-bold text-sm text-indigo-300 animate-pulse">L'IA sta estraendo i piatti...</p>
                   </div>
                )}
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <h3 className="font-black text-xl text-white mb-2">Usa l'Intelligenza Artificiale</h3>
                <p className="text-slate-400 text-sm font-medium">Consigliato. Carica un PDF o un'immagine PNG/JPG (Max 5MB).</p>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAiUpload} 
                accept="image/png, image/jpeg, image/webp, application/pdf" 
                className="hidden" 
              />

              {/* Option Manual */}
              <button 
                onClick={() => { setUseAI(false); handleNext(); }}
                disabled={isAiLoading}
                className="group relative bg-slate-900 border-2 border-slate-800 hover:border-slate-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <h3 className="font-black text-xl text-white mb-2">Creazione Manuale</h3>
                <p className="text-slate-500 text-sm font-medium">Inserisci le categorie e i piatti uno ad uno dalla Dashboard.</p>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: TEMPLATE SELECTION --- */}
        {step === 3 && (
          <div key="step3" className={`flex flex-col flex-1 justify-center ${animationIn}`}>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Scegli l'Estetica.</h1>
            <p className="text-lg text-slate-400 mb-8">Non preoccuparti, potrai cambiare colori e layout in qualsiasi momento.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              
              {/* Modern */}
              <div 
                onClick={() => setTemplate('modern')}
                className={`cursor-pointer rounded-2xl border-2 transition-all p-4 aspect-[4/5] flex flex-col items-center justify-end ${template === 'modern' ? 'border-indigo-500 bg-slate-800' : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'}`}
              >
                 <div className="w-10 h-10 mb-auto mt-2 rounded border-2 border-white flex items-center justify-center bg-white"><span className="text-slate-900 font-sans font-black text-lg">M</span></div>
                 <h4 className="text-white font-sans font-black tracking-tighter text-sm uppercase mb-1">Modern</h4>
              </div>

              {/* Sushi */}
              <div 
                onClick={() => setTemplate('sushi')}
                className={`cursor-pointer rounded-2xl border-2 transition-all p-4 aspect-[4/5] flex flex-col items-center justify-end ${template === 'sushi' ? 'border-emerald-500 bg-[#020617]' : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'}`}
              >
                 <div className="w-10 h-10 mb-auto mt-2 rounded-full border border-emerald-500/30 flex items-center justify-center bg-slate-900 text-emerald-500 font-mono font-black text-lg">S</div>
                 <h4 className="text-white font-mono tracking-widest text-sm uppercase mb-1">Sushi</h4>
              </div>

               {/* Elegant */}
               <div 
                onClick={() => setTemplate('elegant')}
                className={`cursor-pointer rounded-2xl border-2 transition-all p-4 aspect-[4/5] flex flex-col items-center justify-end ${template === 'elegant' ? 'border-[#c9a66b] bg-[#0a0a0b]' : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'}`}
              >
                 <div className="w-10 h-10 mb-auto mt-2 rounded-full border border-[#c9a66b] flex items-center justify-center text-[#c9a66b] font-serif italic text-lg">E</div>
                 <h4 className="text-white font-serif tracking-widest text-sm uppercase mb-1">Elegant</h4>
              </div>

              {/* Vibrant */}
              <div 
                onClick={() => setTemplate('vibrant')}
                className={`cursor-pointer rounded-2xl border-2 transition-all p-4 aspect-[4/5] flex flex-col items-center justify-end ${template === 'vibrant' ? 'border-yellow-400 bg-blue-900/20' : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'}`}
              >
                 <div className="w-10 h-10 mb-auto mt-2 bg-blue-600 transform -rotate-6 rounded-xl flex items-center justify-center text-white font-sans font-black text-lg">V</div>
                 <h4 className="text-white font-sans font-black tracking-tighter text-sm uppercase mb-1">Vibrant</h4>
              </div>
            </div>

            <button 
              disabled={isSaving}
              onClick={finishOnboarding} 
              className="w-full bg-white text-slate-950 hover:bg-indigo-50 disabled:opacity-50 disabled:animate-pulse font-black px-6 py-4 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 text-lg"
            >
              {isSaving ? 'Creazione in corso...' : 'Crea il mio menù'}
              {!isSaving && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
            </button>
          </div>
        )}

        {/* --- STEP 4: SUCCESS / MAGIC CORIANDOLI --- */}
        {step === 4 && (
          <div key="step4" className={`flex flex-col flex-1 items-center justify-center text-center ${animationIn}`}>
            
             <div className="w-64 sm:w-96 mb-8 animate-in zoom-in duration-700 mx-auto">
               <video 
                 src="/success-video.webm" 
                 autoPlay 
                 muted 
                 playsInline
                 onEnded={() => {
                   if (createdMenuId) router.push(`/admin?id=${createdMenuId}`);
                 }}
                 className="w-full h-auto pointer-events-none"
               />
             </div>
            <h1 className="text-5xl font-black mb-4 tracking-tight drop-shadow-lg text-white">Il Tuo Menù è Pronto!</h1>
            <p className="text-xl text-emerald-200 mb-8 font-medium">Preparati alla perfezione. Reindirizzamento al Cruscotto in corso...</p>
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            
          </div>
        )}

      </div>
    </div>
  );
}
