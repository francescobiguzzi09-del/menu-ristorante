"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import QRCode from 'react-qr-code';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MenuRenderer from '@/components/MenuRenderer';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlId = searchParams.get('id');
  
  const [restaurantId, setRestaurantId] = useState(urlId || '');
  const [user, setUser] = useState(null);

  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({ restaurantName: "L'Essenza", customUrl: "" });
  const [appUrl, setAppUrl] = useState('');
  
  // Stati di caricamento
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  
  // Stato per la modale di successo
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [translateSuccess, setTranslateSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('s8');
  const [previewScale, setPreviewScale] = useState(1);
  
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);
  const lastTranslatedContent = useRef('');
  
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Salads', image: null, dietaryTags: [] });

  const DIETARY_OPTIONS = [
    { id: 'glutenFree', label: 'Senza Glutine', icon: '🌾' },
    { id: 'lactoseFree', label: 'Senza Lattosio', icon: '🥛' },
    { id: 'vegetarian', label: 'Vegetariano', icon: '🥬' },
    { id: 'vegan', label: 'Vegano', icon: '🌱' },
    { id: 'nutFree', label: 'Senza Frutta a Guscio', icon: '🥜' },
  ];

  // States per IA Enhancement
  const [enhancingItemId, setEnhancingItemId] = useState(null);
  const [generatingCopyId, setGeneratingCopyId] = useState(null);

  // Migliora foto con Canvas (luminosità, contrasto, saturazione)
  const enhanceImage = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item?.image) return;
    setEnhancingItemId(itemId);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.image;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Applica filtri: luminosità +20%, contrasto +15%, saturazione +30%
      ctx.filter = 'brightness(1.2) contrast(1.15) saturate(1.3)';
      ctx.drawImage(img, 0, 0);
      
      // Leggero effetto sharpen via unsharp mask
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.15;
      ctx.filter = 'blur(0px) contrast(1.5) brightness(1.1)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;

      const enhancedUrl = canvas.toDataURL('image/jpeg', 0.92);
      setItems(items.map(i => i.id === itemId ? { ...i, image: enhancedUrl } : i));
    } catch (err) {
      console.error('Errore enhancement:', err);
      alert('Errore nel miglioramento immagine.');
    } finally {
      setEnhancingItemId(null);
    }
  };

  // Genera copy persuasivo con IA
  const generateCopy = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    setGeneratingCopyId(itemId);
    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          currentDescription: item.description
        })
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map(i => i.id === itemId ? { ...i, description: data.description } : i));
      } else {
        alert(data.error || 'Errore generazione copy');
      }
    } catch (err) {
      console.error(err);
      alert('Errore di connessione al server IA.');
    } finally {
      setGeneratingCopyId(null);
    }
  };

  // Funzioni per l'upload immagine del piatto
  const triggerItemImageUpload = (id) => document.getElementById(`upload-image-${id}`).click();
  const handleItemImageUpload = async (e, id) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 500 * 1024) return alert("L'immagine deve essere più piccola di 500KB.");
    const reader = new FileReader();
    reader.onloadend = () => setItems(items.map(item => item.id === id ? { ...item, image: reader.result } : item));
    reader.readAsDataURL(file);
  };
  
  const triggerNewItemImageUpload = () => document.getElementById('upload-new-item-image').click();
  const handleNewItemImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 500 * 1024) return alert("L'immagine deve essere più piccola di 500KB.");
    const reader = new FileReader();
    reader.onloadend = () => setNewItem({ ...newItem, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, existingStripeAccountId: settings.stripeAccountId })
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Impossibile avviare il collegamento con Stripe.");
      }
    } catch (err) {
      alert("Errore di connessione a Stripe.");
    } finally {
      setIsConnectingStripe(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    if (!urlId) {
      const newId = 'guest-' + Math.random().toString(36).substr(2, 9);
      router.replace(`/admin?id=${newId}`);
      setRestaurantId(newId);
    } else {
      setRestaurantId(urlId);
    }
  }, [urlId, router]);

  useEffect(() => {
    if (!restaurantId) return;
    setIsLoading(true);
    fetch(`/api/menu?restaurantId=${restaurantId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (Array.isArray(data.menu)) setItems(data.menu);
          if (data.settings) setSettings(data.settings);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [restaurantId]);

  // Handle Stripe redirect
  useEffect(() => {
    const stripeAccountParam = searchParams.get('stripe_account');
    if (stripeAccountParam) {
      setSettings(prev => ({ ...prev, stripeAccountId: stripeAccountParam }));
      router.replace(`/admin?id=${restaurantId}`);
      setTimeout(() => alert('Conto Stripe collegato con successo! Ricordati di Salvare le modifiche al menu.'), 500);
    }
  }, [searchParams, restaurantId, router]);

  // Sync QR appUrl based on customUrl settings mapping
  useEffect(() => {
    if (typeof window !== 'undefined' && restaurantId) {
      const base = window.location.origin;
      if (settings.customUrl && settings.customUrl.trim() !== '') {
        let url = settings.customUrl.trim();
        if (!url.startsWith('http')) url = 'https://' + url;
        setAppUrl(url);
      } else {
        setAppUrl(`${base}/${restaurantId}`);
      }
    }
  }, [settings.customUrl, restaurantId]);

  // SIMULATORE DEVICE E MESSAGGISTICA IFRAME
  useEffect(() => {
    if (!showPreview) return;
    const calculateScale = () => {
      const selectorBarHeight = 80; // altezza approssimativa barra selettore + margini
      const verticalPadding = 40; // padding superiore e inferiore
      const availableHeight = window.innerHeight - selectorBarHeight - verticalPadding;
      const availableWidth = window.innerWidth - 80; // padding laterale
      const targetHeight = previewDevice === 'ipad' ? 1024 : previewDevice === 'iphone' ? 852 : 740;
      const targetWidth = previewDevice === 'ipad' ? 768 : previewDevice === 'iphone' ? 393 : 360;
      const scaleH = availableHeight / targetHeight;
      const scaleW = availableWidth / targetWidth;
      setPreviewScale(Math.min(scaleH, scaleW, 1));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [previewDevice, showPreview]);

  useEffect(() => {
    // Aggiorna iframe se è già aperto
    if (showPreview && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', menu: items, settings }, '*');
    }
    
    // Ascolta il segnale di "pronto" dall'iframe appena montato
    const handleMessage = (e) => {
      if (e.data?.type === 'PREVIEW_READY' && iframeRef.current) {
        iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', menu: items, settings }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [items, settings, showPreview]);

  const triggerFileInput = () => fileInputRef.current.click();

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
        setItems(prev => [...prev, ...data.data]);
      } else {
        alert(data.error || "Errore durante l'analisi IA dell'immagine.");
      }
    } catch (err) {
      alert("Errore di connessione al server IA.");
      console.error(err);
    } finally {
      setIsAiLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTranslate = async () => {
    if (items.length === 0) return alert("Nessun piatto da tradurre!");
    
    // Hash check to save AI costs
    const currentContentHash = JSON.stringify(items.map(i => ({ n: i.name, d: i.description })));
    const hasTranslations = items.some(i => i.translations && Object.keys(i.translations).length > 0);
    
    if (hasTranslations && currentContentHash === lastTranslatedContent.current) {
      return alert("Il menu è già stato tradotto e non ci sono modifiche ai testi dall'ultima traduzione!");
    }

    setIsTranslating(true);
    setTranslateSuccess(false);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, targetLanguages: ['en', 'de', 'fr', 'es'] })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setItems(data.data);
      setSettings(prev => ({ ...prev, languages: ['en', 'de', 'fr', 'es'] }));
      
      // Save content hash to prevent redundant calls
      lastTranslatedContent.current = currentContentHash;
      
      // Auto-save the menu to persist translations
      if (restaurantId) {
        processSaveMenu(data.data, { ...settings, languages: ['en', 'de', 'fr', 'es'] });
      }
      
      setTranslateSuccess(true);
      setTimeout(() => setTranslateSuccess(false), 6000);
    } catch (err) {
      alert("Errore traduzione: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const processSaveMenu = async (overrideItems = null, overrideSettings = null) => {
    if (!restaurantId) return;
    setIsSaving(true);
    setShowGuestWarning(false);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurantId,
          data: { 
            settings: overrideSettings || settings, 
            menu: overrideItems || items 
          },
          userId: user?.id || null
        })
      });
      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error);
      setShowSuccessModal(true);
    } catch (err) {
      alert('❌ Errore durante il salvataggio: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMenuClick = () => {
    if (!user) {
      setShowGuestWarning(true);
    } else {
      processSaveMenu();
    }
  };

  const handleDelete = (id) => setItems(items.filter(item => item.id !== id));
  const handlePriceChange = (id, newPrice) => setItems(items.map(item => item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item));
  const handleNameChange = (id, newName) => setItems(items.map(item => item.id === id ? { ...item, name: newName } : item));
  const handleSettingsChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleAddProduct = () => {
    if (!newItem.name || !newItem.price) return alert("Inserisci quantomeno un nome e un prezzo.");
    const product = {
      id: 'manual-' + Date.now(),
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price) || 0,
      category: newItem.category,
      image: newItem.image,
      dietaryTags: newItem.dietaryTags || []
    };
    setItems([...items, product]);
    setNewItem({ name: '', description: '', price: '', category: 'Salads', image: null, dietaryTags: [] });
  };

  const handleDownloadQR = () => {
    const container = document.getElementById('qr-wrapper');
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu-qr-code.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400 font-medium">Caricamento piattaforma...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* HEADER PREMIUM */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-2xl shadow-indigo-900/20">
        <div className="max-w-5xl mx-auto px-6 h-[72px] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">SmartMenu AI</h1>
              <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-300/80 uppercase tracking-widest mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="truncate w-40" title={restaurantId}>{restaurantId || 'CARICAMENTO...'}</span>
              </div>
            </div>
          </div>
          
          {user ? (
            <button onClick={() => router.push('/dashboard')} className="text-sm font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 flex gap-2 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Dashboard
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="text-sm font-bold bg-indigo-500 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20 flex gap-2 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              Accedi
            </button>
          )}
        </div>
      </header>

      {/* GUEST BANNER */}
      {!user && (
        <div className="max-w-4xl mx-auto mt-6 px-6 relative z-10">
          <div className="bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200 px-5 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-3 text-amber-900 text-xs sm:text-sm font-medium">
              <svg className="shrink-0 text-amber-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Stai usando l'App come <strong className="font-black border-b border-amber-900/30">Ospite</strong>. Se perdi il link perderai il tuo lavoro.</span>
            </div>
            <button onClick={() => router.push('/login')} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all whitespace-nowrap">
              Crea Account Gratis
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* IMPOSTAZIONI RISTORANTE E CONDIVISIONE */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Setup Ristorante</h2>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col h-full">
                <label className="text-sm font-bold text-slate-700 block mb-2">Nome Ristorante</label>
                <input 
                  type="text" 
                  name="restaurantName"
                  value={settings.restaurantName} 
                  onChange={handleSettingsChange}
                  className="w-full mt-auto px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                />
              </div>
              <div className="flex flex-col h-full">
                <label className="text-sm font-bold text-slate-700 block mb-1">Sito Personalizzato (Opzionale)</label>
                <p className="text-xs text-slate-500 mb-3">Inserisci qui il tuo sito se vuoi che il QR Code vi indirizzi direttamente.</p>
                <input 
                  type="text" 
                  name="customUrl"
                  value={settings.customUrl} 
                  onChange={handleSettingsChange}
                  className="w-full mt-auto px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                  placeholder="es. pizzeriamario.it/menu"
                />
              </div>
              <div className="md:col-span-2 flex flex-col pt-6 border-t border-slate-100">
                <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                  <div className="w-full md:w-1/2 flex flex-col h-full">
                    <label className="text-sm font-bold text-slate-700 block mb-1">Prezzo Coperto (Opzionale)</label>
                    <p className="text-xs text-slate-500 mb-3">Se indicato, apparirà in fondo al tuo menù digitale come costo del servizio.</p>
                    <div className="relative mt-auto">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        type="number" 
                        step="0.50"
                        name="coverCharge"
                        value={settings.coverCharge || ""} 
                        onChange={handleSettingsChange}
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
                        placeholder="Es. 2.50"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 md:border-l border-slate-100 md:pl-8 flex flex-col h-full">
                    <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2 mb-1">
                      <span>White-Label <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider ml-2">Premium</span></span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={settings.whiteLabel || false} onChange={(e) => setSettings({...settings, whiteLabel: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Rimuove il marchio "Powered by SmartMenu AI" in fondo alla pagina per un'esperienza 100% dedicata al tuo brand.</p>
                  </div>
                </div>

                {/* Link TripAdvisor / Recensioni */}
                <div className="border-t border-slate-100 pt-6 mt-6">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    Link Recensioni TripAdvisor
                    <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Premium</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">Inserisci il link alla pagina TripAdvisor del tuo ristorante. I clienti potranno lasciare una recensione direttamente dal menu e verranno invitati a recensire anche su TripAdvisor.</p>
                  <input
                    type="url"
                    name="tripadvisorUrl"
                    value={settings.tripadvisorUrl || ''}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="https://www.tripadvisor.it/Restaurant_Review-..."
                  />
                </div>

                {/* Ordina dal Menu */}
                <div className="border-t border-slate-100 pt-6 mt-6">
                  <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2 mb-1">
                    <span>Funzione Ordina <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm ml-2">Premium</span></span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={settings.enableOrdering || false} onChange={(e) => setSettings({...settings, enableOrdering: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Permette ai clienti di aggiungere piatti al carrello e inviare un ordine direttamente dal menu digitale.</p>
                  
                  {settings.enableOrdering && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">Pagamenti con Stripe</span>
                        {settings.stripeAccountId ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Attivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            Non configurato
                          </span>
                        )}
                      </div>
                      
                      {settings.stripeAccountId ? (
                         <div className="flex items-center justify-between gap-4">
                           <p className="text-xs text-slate-500">I pagamenti dal menu verranno accreditati automaticamente sul tuo conto bancario.</p>
                           <button onClick={handleConnectStripe} disabled={isConnectingStripe} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 whitespace-nowrap">Gestisci Conto</button>
                         </div>
                      ) : (
                        <div>
                           <p className="text-xs text-slate-500 mb-3">Necessario per ricevere fondi da Apple Pay, Google Pay e Carte.</p>
                           <button 
                             onClick={handleConnectStripe} 
                             disabled={isConnectingStripe}
                             className="w-full bg-[#635BFF] hover:bg-[#5851df] text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-md shadow-[#635BFF]/20 flex items-center justify-center gap-2"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                             {isConnectingStripe ? 'Reindirizzamento...' : 'Collega Conto per ricevere Pagamenti'}
                           </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SCELTA STILE */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-6 w-1 bg-pink-500 rounded-full"></div>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Design Menù</h2>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Qual è l'atmosfera del tuo locale?</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              
              {/* Elegant */}
              <div 
                onClick={() => setSettings({...settings, template: 'elegant', palette: 'default'})}
                className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${(!settings.template || settings.template === 'elegant') ? 'border-indigo-500 shadow-lg scale-[1.02] z-10' : 'border-slate-100 hover:border-indigo-200 opacity-70 hover:opacity-100'}`}
              >
                 <div className="absolute inset-0 bg-[#0a0a0b] -z-10"></div>
                 <div className="w-10 h-10 mb-auto mt-4 rounded-full border border-[#c9a66b] flex items-center justify-center">
                    <span className="text-[#c9a66b] font-serif italic text-lg">E</span>
                 </div>
                 <h4 className="text-white font-serif tracking-widest text-sm uppercase mb-1">Elegant</h4>
                 <div className="h-0.5 w-6 bg-[#c9a66b]"></div>
                 {(!settings.template || settings.template === 'elegant') && <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

              {/* Modern */}
              <div 
                onClick={() => setSettings({...settings, template: 'modern', palette: 'default'})}
                className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'modern' ? 'border-zinc-900 shadow-lg scale-[1.02] z-10' : 'border-slate-100 hover:border-zinc-300 opacity-70 hover:opacity-100'}`}
              >
                 <div className="absolute inset-0 bg-white -z-10"></div>
                 <div className="absolute inset-0 border-[10px] border-zinc-100/50 -z-10"></div>
                 <div className="w-10 h-10 mb-auto mt-4 rounded border-2 border-zinc-900 flex items-center justify-center">
                    <span className="text-zinc-900 font-sans font-black text-lg">M</span>
                 </div>
                 <h4 className="text-zinc-900 font-sans font-black tracking-tighter text-sm uppercase mb-1">Modern</h4>
                 <div className="h-1 w-6 bg-zinc-900"></div>
                 {settings.template === 'modern' && <div className="absolute top-3 right-3 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

              {/* Rustic */}
              <div 
                onClick={() => setSettings({...settings, template: 'rustic', palette: 'default'})}
                className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'rustic' ? 'border-[#d97757] shadow-lg scale-[1.02] z-10' : 'border-slate-100 hover:border-[#e8dbce] opacity-70 hover:opacity-100'}`}
              >
                 <div className="absolute inset-0 bg-[#fdfbf7] -z-10"></div>
                 <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-[#e8dbce] rounded-full blur-xl -z-10"></div>
                 <div className="w-10 h-10 mb-auto mt-4 rounded-full border-2 border-dashed border-[#d97757] flex items-center justify-center">
                    <span className="text-[#2d241c] font-serif font-bold text-lg">R</span>
                 </div>
                 <h4 className="text-[#2d241c] font-serif font-bold text-sm capitalize mb-1">Rustic</h4>
                 <div className="h-0.5 border-t border-dashed border-[#d97757] w-8"></div>
                 {settings.template === 'rustic' && <div className="absolute top-3 right-3 w-6 h-6 bg-[#d97757] rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

              {/* Cinematic (Premium) */}
              <div 
                onClick={() => setSettings({...settings, template: 'cinematic', palette: 'default'})}
                className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'cinematic' ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02] z-10' : 'border-slate-100 hover:border-amber-300 opacity-70 hover:opacity-100'}`}
              >
                 <div className="absolute inset-0 bg-slate-950 -z-10"></div>
                 <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-amber-500/20 rounded-full blur-xl -z-10 animate-pulse"></div>
                 <div className="w-10 h-10 mb-auto mt-4 rounded-full bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="text-amber-400 font-sans font-light text-lg">C</span>
                 </div>
                 <h4 className="text-white font-sans font-black tracking-widest text-sm uppercase mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Cinematic</h4>
                 <div className="h-px w-6 bg-amber-500/50"></div>
                 {settings.template === 'cinematic' && <div className="absolute top-3 left-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

              {/* Vibrant */}
              <div 
                onClick={() => setSettings({...settings, template: 'vibrant', palette: 'default'})}
                className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'vibrant' ? 'border-slate-900 shadow-[6px_6px_0px_#fde047] scale-[1.02] -translate-y-1 z-10' : 'border-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100'}`}
              >
                 <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">Premium</span>
                 <div className="absolute inset-0 bg-pink-50 -z-10"></div>
                 <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-yellow-400 rounded-full -z-10"></div>
                 <div className="w-12 h-10 mb-auto mt-4 bg-blue-600 rounded-xl transform -rotate-6 flex items-center justify-center shadow-sm border border-blue-700">
                    <span className="text-white font-sans font-black text-lg">V</span>
                 </div>
                 <h4 className="text-slate-900 font-sans font-black tracking-tighter text-sm uppercase mb-1">Vibrant</h4>
                 <div className="h-1.5 w-6 bg-slate-900 rounded-full"></div>
                 {settings.template === 'vibrant' && <div className="absolute top-3 right-3 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

              {/* Luxury (Premium) */}
              <div 
                onClick={() => setSettings({...settings, template: 'luxury', palette: 'default'})}
                className={`isolate relative cursor-pointer rounded-2xl border-[3px] transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'luxury' ? 'border-stone-800 shadow-2xl scale-[1.02] z-10' : 'border-slate-200 hover:border-stone-400 opacity-70 hover:opacity-100'}`}
              >
                 <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">Premium</span>
                 <div className="absolute inset-0 bg-stone-100 -z-10"></div>
                 <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-stone-200 to-transparent -z-10"></div>
                 <div className="w-10 h-14 mb-auto mt-2 border border-stone-800 flex items-center justify-center bg-transparent">
                    <span className="text-stone-800 font-serif text-xl">L</span>
                 </div>
                 <h4 className="text-stone-800 font-serif tracking-widest text-sm uppercase mb-1">Luxury</h4>
                 <div className="h-[1px] w-6 bg-stone-800"></div>
                 {settings.template === 'luxury' && <div className="absolute top-3 left-3 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

            </div>

            {/* PALETTE SCELTA - DYNAMIC COMPONENT */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Palette Colori</h4>
              <div className="flex flex-wrap gap-3">
                {(() => {
                   const currTemplate = settings.template || 'elegant';
                   const palettes = {
                     elegant: [
                       { id: 'default', name: 'Gold', hex: '#c9a66b' },
                       { id: 'sapphire', name: 'Sapphire', hex: '#3b82f6' },
                       { id: 'ruby', name: 'Ruby', hex: '#e11d48' }
                     ],
                     modern: [
                       { id: 'default', name: 'Mono', hex: '#09090b' },
                       { id: 'ocean', name: 'Ocean', hex: '#0ea5e9' },
                       { id: 'forest', name: 'Forest', hex: '#10b981' }
                     ],
                     rustic: [
                       { id: 'default', name: 'Cotto', hex: '#d97757' },
                       { id: 'olive', name: 'Olivo', hex: '#65a30d' },
                       { id: 'wine', name: 'Vino', hex: '#9f1239' }
                     ],
                     vibrant: [
                       { id: 'default', name: 'Pop', hex: '#3b82f6' },
                       { id: 'neon', name: 'Cyber', hex: '#000000' },
                       { id: 'sunset', name: 'Sunset', hex: '#f97316' }
                     ],
                     cinematic: [
                       { id: 'default', name: 'Gold', hex: '#fbbf24' },
                       { id: 'sapphire', name: 'Sapphire', hex: '#3b82f6' },
                       { id: 'ruby', name: 'Ruby', hex: '#f43f5e' }
                     ],
                     supreme: [
                       { id: 'default', name: 'Indigo', hex: '#4f46e5' },
                       { id: 'neon', name: 'Neon', hex: '#a3e635' },
                       { id: 'sunset', name: 'Sunset', hex: '#f43f5e' }
                     ]
                   };
                   const activePalettes = palettes[currTemplate] || palettes.elegant;
                   const activePaletteId = settings.palette || 'default';

                   return activePalettes.map(pal => (
                     <button
                       key={pal.id}
                       onClick={() => setSettings({...settings, palette: pal.id})}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${activePaletteId === pal.id ? 'border-slate-900 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'}`}
                     >
                       <span className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{backgroundColor: pal.hex}}></span>
                       <span className={`text-sm font-bold ${activePaletteId === pal.id ? 'text-slate-900' : 'text-slate-600'}`}>{pal.name}</span>
                     </button>
                   ));
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* TRADUZIONE IA */}
        {items.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-6 w-1 bg-fuchsia-500 rounded-full"></div>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Traduzioni IA (Premium)</h2>
          </div>
          <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-3xl border border-fuchsia-100 p-8 shadow-sm">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-block bg-fuchsia-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-md shadow-fuchsia-500/20">Esclusiva Plus</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Multilingua Automatico</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Rendi il tuo menù internazionale. Usa l'Intelligenza Artificiale per tradurre istantaneamente tutti i piatti (titoli, descrizioni e categorie) in Inglese, Tedesco, Francese e Spagnolo.
              </p>
              
              <button 
                onClick={handleTranslate} 
                disabled={isTranslating}
                className={`${translateSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-500/30'} text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto mx-auto relative overflow-hidden`}
              >
                {isTranslating ? (
                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : translateSuccess ? (
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 5 6-3 6 3 6-3v16l-6 3-6-3-6 3v-16Z"/><path d="M8 2v16"/><path d="M16 6v16"/></svg>
                )}
                {isTranslating ? 'Traduzione in corso...' : translateSuccess ? 'Traduzione Completata!' : 'Genera Traduzioni IA (EN, DE, FR, ES)'}
              </button>
              
              {translateSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  Fantastico! Ricordati di cliccare <strong>"Genera Menù Definitivo"</strong> in fondo alla pagina per salvare e pubblicare le modifiche online.
                </div>
              )}
              
              {settings.languages && settings.languages.includes('en') && (
                 <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <span className="bg-white border border-fuchsia-200 text-fuchsia-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"><span className="text-lg">🇬🇧</span> Inglese ATTIVO</span>
                    <span className="bg-white border border-fuchsia-200 text-fuchsia-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"><span className="text-lg">🇩🇪</span> Tedesco ATTIVO</span>
                    <span className="bg-white border border-fuchsia-200 text-fuchsia-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"><span className="text-lg">🇫🇷</span> Francese ATTIVO</span>
                    <span className="bg-white border border-fuchsia-200 text-fuchsia-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"><span className="text-lg">🇪🇸</span> Spagnolo ATTIVO</span>
                 </div>
              )}
            </div>
          </div>
        </section>
        )}

        {/* SEZIONE GENERAZIONE IA */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Importazione</h2>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Da immagine a Menù Digitale</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Carica la foto che hai scattato. L'AI estrarrà i piatti, gli ingredienti e i prezzi e genererà il menù in pochi secondi.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAiUpload} />
                <button 
                  onClick={triggerFileInput} 
                  disabled={isAiLoading}
                  className="bg-indigo-50 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100 text-indigo-700 font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm relative overflow-hidden flex-1"
                >
                  {isAiLoading ? (
                     <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  )}
                  {isAiLoading ? 'Analisi Immagine...' : 'Carica Foto Lavagna'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* GESTIONE MANUALE MENU */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-1 bg-teal-500 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Gestione Piatti ({items.length})</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Lista Piatti Esistenti */}
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Foto Piatto */}
                  <div className="relative shrink-0">
                    <div 
                      onClick={() => !item.image && triggerItemImageUpload(item.id)}
                      className={`w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 transition-colors ${!item.image ? 'cursor-pointer hover:border-teal-500 group-hover:shadow-sm' : ''}`}
                    >
                      {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      ) : (
                          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      )}
                    </div>
                    {item.image && (
                      <button 
                        onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, image: null } : i))}
                        className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 flex items-center justify-center w-6 h-6 cursor-pointer"
                        title="Rimuovi foto"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {/* Bottone Migliora Foto (sotto la thumbnail) */}
                  {item.image && (
                    <button
                      onClick={() => enhanceImage(item.id)}
                      disabled={enhancingItemId === item.id}
                      className="mt-1.5 flex items-center gap-1 px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 text-[9px] font-bold rounded-lg border border-violet-200 transition-all disabled:opacity-50 w-16 justify-center"
                      title="Migliora automaticamente luminosita, contrasto e saturazione"
                    >
                      {enhancingItemId === item.id ? (
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                      )}
                      {enhancingItemId === item.id ? '...' : 'Migliora'}
                    </button>
                  )}
                  <input type="file" accept="image/*" id={`upload-image-${item.id}`} className="hidden" onChange={(e) => handleItemImageUpload(e, item.id)} />

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text"
                        value={item.name}
                        onChange={(e) => handleNameChange(item.id, e.target.value)}
                        className="font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-teal-500 bg-transparent focus:bg-white p-1 rounded transition-colors w-full sm:w-[50%] outline-none text-lg"
                      />
                      <input 
                        type="text"
                        value={item.category}
                        onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, category: e.target.value } : i))}
                        className="inline-flex px-2.5 py-1 rounded bg-teal-50 text-teal-700 text-xs font-bold tracking-wide w-fit outline-none border border-transparent focus:border-teal-300 focus:bg-teal-100 transition-colors"
                      />
                    </div>
                    <input 
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                      className="text-sm text-slate-500 px-1 font-medium w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded outline-none transition-colors"
                      placeholder="Descrizione opzionale.."
                    />
                    {/* Bottone Genera Copy IA */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => generateCopy(item.id)}
                        disabled={generatingCopyId === item.id}
                        className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 text-[10px] font-bold rounded-lg border border-violet-200 transition-all disabled:opacity-50"
                      >
                        {generatingCopyId === item.id ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8l4-2"/><path d="M12 10l-4-2"/><circle cx="12" cy="18" r="4"/></svg>
                        )}
                        {generatingCopyId === item.id ? 'Generando...' : (item.description ? 'Migliora copy IA' : 'Genera copy IA')}
                      </button>
                      <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Premium</span>
                    </div>
                    {/* TAG DIETETICI (Premium) */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                       <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm mr-1">Premium</span>
                       {DIETARY_OPTIONS.map(opt => {
                          const tags = item.dietaryTags || [];
                          const isActive = tags.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const newTags = isActive ? tags.filter(t => t !== opt.id) : [...tags, opt.id];
                                setItems(items.map(i => i.id === item.id ? { ...i, dietaryTags: newTags } : i));
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                            >
                              <span>{opt.icon}</span> {opt.label}
                            </button>
                          );
                       })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0 border-slate-100">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.50"
                        value={item.price}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-24 pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl opacity-50 grayscale">🍽️</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Il menù è vuoto</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">Carica la foto della tua lavagna per aggiungere automaticamente tutti i tuoi piatti.</p>
                </div>
              )}
            </div>

            {/* Aggiunta Piatto Manuale */}
            <div className="bg-slate-50 p-6 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Oppure aggiungi manualmente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div 
                      onClick={() => !newItem.image && triggerNewItemImageUpload()}
                      className={`w-12 h-12 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${!newItem.image ? 'cursor-pointer border-2 border-dashed border-slate-300 hover:border-teal-500' : 'border-2 border-slate-200'}`}
                    >
                      {newItem.image ? (
                          <img src={newItem.image} className="w-full h-full object-cover" alt="Nuovo piatto" />
                      ) : (
                          <span className="text-slate-400 text-sm">📸</span>
                      )}
                    </div>
                    {newItem.image && (
                      <button 
                        onClick={() => setNewItem({...newItem, image: null})}
                        className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 flex items-center justify-center w-5 h-5 cursor-pointer"
                        title="Rimuovi foto"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  <input type="file" accept="image/*" id="upload-new-item-image" className="hidden" onChange={handleNewItemImageUpload} />
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 block mb-1">NOME</label>
                    <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Es. Salad" />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 block mb-1">CATEGORIA</label>
                  <input type="text" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Es. Sides" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 block mb-1">DESCRIZIONE</label>
                  <input type="text" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Opzionale.." />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 block mb-1">PREZZO ($)</label>
                  <input type="number" step="0.50" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                </div>
                <div className="md:col-span-5">
                  <label className="text-xs font-bold text-slate-500 block mb-1">TAG DIETETICI <span className="text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm ml-1">Premium</span></label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map(opt => {
                       const isActive = (newItem.dietaryTags || []).includes(opt.id);
                       return (
                         <button
                           key={opt.id}
                           type="button"
                           onClick={() => {
                             const curr = newItem.dietaryTags || [];
                             const newTags = isActive ? curr.filter(t => t !== opt.id) : [...curr, opt.id];
                             setNewItem({...newItem, dietaryTags: newTags});
                           }}
                           className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                         >
                           <span>{opt.icon}</span> {opt.label}
                         </button>
                       );
                    })}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <button onClick={handleAddProduct} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                    Aggiungi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QR CODE & GENERAZIONE */}
        {items.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex flex-col items-center">
                <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Tutto pronto!</h2>
                <p className="text-slate-500 mb-8 max-w-sm text-center text-sm">
                  Salva il tuo menù per aggiornare il tuo link dinamico online. Il QR Code rifletterà a vita questo aggiornamento.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl mx-auto mb-10">
                   <button 
                     onClick={() => setShowPreview(true)}
                     className="bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 flex-1"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                     Anteprima Live
                   </button>
                   <button 
                     onClick={handleSaveMenuClick}
                     disabled={isSaving}
                     className="flex-[1.5] bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isSaving ? (
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                     )}
                     {isSaving ? 'Salvataggio...' : 'Crea Menù'}
                   </button>
                </div>

             </div>
          </section>
        )}
      </main>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center border border-slate-100">
            
            {/* Tasto Chiudi */}
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            {/* Icona Successo */}
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Generazione Completata!</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Il tuo menù è online e pronto per essere sfogliato dai clienti.
            </p>

            {/* Inquadratura QR direttamente nel bottone per risparmiare spazio, o sopra visibile */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full mb-6 flex flex-col items-center">
               <div className="bg-white p-3 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-slate-100 mb-3" id="qr-wrapper">
                 <QRCode value={appUrl} size={130} level="H" />
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate w-full px-2">{appUrl.replace('https://', '')}</span>
            </div>
            
            <div className="space-y-3 w-full">
              {/* Bottone Guarda Menù */}
              <a 
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 text-sm"
              >
                Guarda Menù
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              
              {/* Bottone Scarica QR Code */}
              <button 
                onClick={handleDownloadQR}
                className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Scarica QR Code SVG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GUEST WARNING MODAL POPUP */}
      {showGuestWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center border border-slate-100">
            
            <button 
              onClick={() => setShowGuestWarning(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            
            <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Attenzione, sei Ospite!</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Il tuo menù verrà generato, ma se  <strong className="text-slate-700">perdi l'URL o chiudi questo browser</strong> non potrai più modificarlo in futuro e andrà perso.
            </p>
            
            <div className="space-y-3 w-full">
              <button 
                onClick={() => router.push('/login')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-wider py-4 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
              >
                Crea Account / Accedi
              </button>
              
              <button 
                onClick={processSaveMenu}
                className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-3.5 px-4 rounded-xl transition-all text-sm"
              >
                Continua e Genera (Senza salvare)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL POPUP */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex flex-col items-center p-2 sm:p-4 animate-in fade-in duration-300">
          
          {/* DEVICE SELECTOR - sempre visibile in alto */}
          <div className="flex bg-slate-800 p-1.5 rounded-2xl my-3 shadow-xl border border-slate-700/50 backdrop-blur-md z-10 shrink-0">
            <button 
               onClick={() => setPreviewDevice('iphone')} 
               className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${previewDevice === 'iphone' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              iPhone 14 Pro
            </button>
            <button 
               onClick={() => setPreviewDevice('s8')} 
               className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${previewDevice === 's8' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Galaxy S8+
            </button>
            <button 
               onClick={() => setPreviewDevice('ipad')} 
               className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${previewDevice === 'ipad' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              iPad Mini
            </button>
          </div>

          {/* TELEFONO SIMULATO */}
          <div 
             className="relative bg-slate-950 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border-[12px] border-slate-800 transition-all duration-500 origin-top shrink-0"
             style={{
                width: previewDevice === 'ipad' ? 768 : previewDevice === 'iphone' ? 393 : 360,
                height: previewDevice === 'ipad' ? 1024 : previewDevice === 'iphone' ? 852 : 740,
                transform: `scale(${previewScale})`
             }}
          >
             <div className="h-7 border-b border-slate-800 flex items-center justify-between px-5 shrink-0 z-50 bg-slate-950">
                <div className="flex items-center gap-2">
                   <span className="flex h-1.5 w-1.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
                   <span className="text-slate-300 font-bold text-[8px] tracking-widest uppercase truncate">{previewDevice === 'ipad' ? 'iPad Mini' : previewDevice === 'iphone' ? 'iPhone 14 Pro' : 'Galaxy S8+'}</span>
                </div>
                <div className="w-16 h-4 bg-slate-900 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 hidden sm:block"></div>
                <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1 rounded-lg flex items-center gap-1 md:hidden">
                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
             </div>
             <div className="flex-1 relative w-full bg-slate-50">
                <iframe 
                   ref={iframeRef}
                   src="/preview"
                   className="w-full h-full border-0 absolute inset-0 bg-slate-50 transition-opacity duration-300"
                   title="Live Preview Simulator"
                />
             </div>
          </div>
          
          {/* BOTTONE CHIUDI X SCREEN GRANDE */}
          <button onClick={() => setShowPreview(false)} className="hidden md:flex absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-full items-center gap-1 shadow-lg border border-white/10 backdrop-blur-sm z-50">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400 font-medium">Caricamento piattaforma...</p></div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
