"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import QRCode from 'react-qr-code';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MenuRenderer from '@/components/MenuRenderer';
import { useToast } from '@/components/Toast';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
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
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedUpsellItemId, setSelectedUpsellItemId] = useState('');
  const [translateSuccess, setTranslateSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('s8');
  const [previewScale, setPreviewScale] = useState(1);
  const [showPdfWarning, setShowPdfWarning] = useState(false);
  const [userHasCustomFont, setUserHasCustomFont] = useState(false);

  const fileInputRef = useRef(null);
  const desktopIframeRef = useRef(null);
  const mobileIframeRef = useRef(null);
  const lastTranslatedContent = useRef('');

  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Salads', subcategory: '', image: null, dietaryTags: [], badge: null, ingredients: '', variants: [], suggestedItems: [] });

  const DIETARY_OPTIONS = [
    { id: 'glutenFree', label: 'Senza Glutine', icon: '🌾' },
    { id: 'lactoseFree', label: 'Senza Lattosio', icon: '🥛' },
    { id: 'vegetarian', label: 'Vegetariano', icon: '🥬' },
    { id: 'vegan', label: 'Vegano', icon: '🌱' },
    { id: 'nutFree', label: 'Senza Frutta a Guscio', icon: '🥜' },
  ];

  const BADGE_OPTIONS = [
    { id: 'new', label: 'Novita', color: 'bg-emerald-500 text-white border-emerald-400' },
    { id: 'bestseller', label: 'Best Seller', color: 'bg-amber-500 text-white border-amber-400' },
    { id: 'chef', label: 'Consigliato', color: 'bg-indigo-500 text-white border-indigo-400' },
    { id: 'spicy', label: 'Piccante', color: 'bg-rose-500 text-white border-rose-400' },
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
      toast.error('Errore nel miglioramento immagine.', 'Errore');
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
        toast.error(data.error || 'Errore generazione copy', 'Errore IA');
      }
    } catch (err) {
      console.error(err);
      toast.error('Errore di connessione al server IA.', 'Errore');
    } finally {
      setGeneratingCopyId(null);
    }
  };

  // Funzioni per l'upload immagine del piatto
  const triggerItemImageUpload = (id) => document.getElementById(`upload-image-${id}`).click();
  const handleItemImageUpload = async (e, id) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 500 * 1024) { toast.warning("L'immagine deve essere più piccola di 500KB.", 'File troppo grande'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setItems(items.map(item => item.id === id ? { ...item, image: reader.result } : item));
    reader.readAsDataURL(file);
  };

  const triggerNewItemImageUpload = () => document.getElementById('upload-new-item-image').click();
  const handleNewItemImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 500 * 1024) { toast.warning("L'immagine deve essere più piccola di 500KB.", 'File troppo grande'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setNewItem({ ...newItem, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleUploadCategoryImage = async (e, categoryName) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 500 * 1024) { toast.warning("L'immagine deve essere più piccola di 500KB.", 'File troppo grande'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const newMeta = { ...(settings.categoryMetadata || {}) };
      newMeta[categoryName] = { ...(newMeta[categoryName] || {}), image: reader.result };
      setSettings({ ...settings, categoryMetadata: newMeta });
    };
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
        toast.error(data.error || 'Impossibile avviare il collegamento con Stripe.', 'Errore Stripe');
      }
    } catch (err) {
      toast.error('Errore di connessione a Stripe.', 'Errore');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles').select('status, suspended_until').eq('id', session.user.id).single().then(({ data: profile }) => {
          if (profile) {
            if (profile.status === 'banned') {
              router.push('/blocked');
              return;
            }
            if (profile.status === 'suspended') {
              if (new Date() < new Date(profile.suspended_until)) {
                router.push('/blocked');
                return;
              } else {
                supabase.from('profiles').update({ status: 'active', suspended_until: null }).eq('id', session.user.id);
              }
            }
          }
        });
      }
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
      setTimeout(() => toast.success('Conto Stripe collegato con successo! Ricordati di Salvare le modifiche al menu.', 'Stripe'), 500);
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
    if (desktopIframeRef.current?.contentWindow) {
      desktopIframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', menu: items, settings }, '*');
    }
    if (showPreview && mobileIframeRef.current?.contentWindow) {
      mobileIframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', menu: items, settings }, '*');
    }

    // Ascolta il segnale di "pronto" dall'iframe appena montato
    const handleMessage = (e) => {
      if (e.data?.type === 'PREVIEW_READY') {
        if (desktopIframeRef.current) {
          desktopIframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', menu: items, settings }, '*');
        }
        if (mobileIframeRef.current) {
          mobileIframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PREVIEW', menu: items, settings }, '*');
        }
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

  const handleTranslate = async () => {
    if (items.length === 0) { toast.warning('Nessun piatto da tradurre!', 'Attenzione'); return; }

    // Hash check to save AI costs
    const currentContentHash = JSON.stringify(items.map(i => ({ n: i.name, d: i.description })));
    const hasTranslations = items.some(i => i.translations && Object.keys(i.translations).length > 0);

    if (hasTranslations && currentContentHash === lastTranslatedContent.current) {
      toast.info("Il menu è già stato tradotto e non ci sono modifiche ai testi dall'ultima traduzione!", 'Già tradotto');
      return;
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
      toast.error('Errore traduzione: ' + err.message, 'Errore');
    } finally {
      setIsTranslating(false);
    }
  };

  const processSaveMenu = async (overrideItems = null, overrideSettings = null, silent = false) => {
    if (!restaurantId) return;
    if (!silent) setIsSaving(true);
    if (!silent) setShowGuestWarning(false);
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
      if (!silent) setShowSuccessModal(true);
    } catch (err) {
      if (!silent) toast.error('Errore durante il salvataggio: ' + err.message, 'Errore');
      else console.error('Silent save error:', err);
    } finally {
      if (!silent) setIsSaving(false);
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

  const handleTemplateChange = (templateName) => {
    const defaultFonts = {
      elegant: 'playfair', modern: 'inter', rustic: 'outfit',
      cinematic: 'space', vibrant: 'quicksand', luxury: 'playfair',
      sushi: 'space', taverna: 'playfair', brunch: 'outfit'
    };
    const newSettings = { ...settings, template: templateName, palette: 'default' };
    if (!userHasCustomFont) {
      newSettings.fontFamily = defaultFonts[templateName] || 'inter';
    }
    setSettings(newSettings);
    setUserHasCustomFont(false);
  };

  const handleAddProduct = () => {
    if (!newItem.name || !newItem.price) { toast.warning('Inserisci quantomeno un nome e un prezzo.', 'Dati mancanti'); return; }
    const product = {
      id: 'manual-' + Date.now().toString() + Math.random().toString(36).substring(7),
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price) || 0,
      category: newItem.category,
      image: newItem.image,
      dietaryTags: newItem.dietaryTags || [],
      badge: newItem.badge || null,
      ingredients: newItem.ingredients || '',
      variants: newItem.variants && newItem.variants.length > 0 ? newItem.variants : []
    };
    setItems([...items, product]);
    setNewItem({ name: '', description: '', price: '', category: newItem.category || 'Salads', image: null, dietaryTags: [], badge: null, ingredients: '', variants: [], showAdvanced: false });
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
    <div className="flex bg-slate-50 text-slate-800 font-sans h-[100dvh] overflow-hidden">

      {/* ----------- COLONNA 1: SIDEBAR NAVIGAZIONE ----------- */}
      <aside className="w-[80px] sm:w-[240px] bg-slate-950 flex flex-col items-center sm:items-stretch py-6 border-r border-slate-800 z-20 shrink-0">
        <div className="px-0 sm:px-6 mb-8 flex items-center justify-center sm:justify-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            <img src="/sm-logo.png" alt="Smart Menu Logo" className="w-full h-full object-contain scale-[2.5]" />
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-white leading-tight truncate">SmartMenu AI</h1>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300/80 uppercase tracking-widest mt-0.5">
              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="truncate max-w-[100px]">{restaurantId}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 sm:px-4 space-y-1.5 overflow-y-auto w-full scrollbar-hide py-2">
          {/* Piatti e Menu */}
          <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'menu' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 5 6-3 6 3 6-3v16l-6 3-6-3-6 3v-16Z" /><path d="M8 2v16" /><path d="M16 6v16" /></svg>
            <span className="hidden sm:block truncate">Piatti e Menu</span>
          </button>

          {/* Upselling & Promo */}
          <button onClick={() => setActiveTab('upsell')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'upsell' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 3 9-3 9 19-9Z" /><path d="M13 13 8 8" /></svg>
            <span className="hidden sm:block truncate">Upselling & Promo</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 pt-3 pb-1 opacity-50">
            <div className="h-[1px] flex-1 bg-slate-700"></div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Design</span>
            <div className="h-[1px] flex-1 bg-slate-700"></div>
          </div>

          {/* Tema & Colori (ex Estetica) */}
          <button onClick={() => setActiveTab('design')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'design' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            <span className="hidden sm:block truncate">Tema & Colori</span>
          </button>

          {/* Tipografia */}
          <button onClick={() => setActiveTab('typography')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'typography' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>
            <span className="hidden sm:block truncate">Tipografia</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 pt-3 pb-1 opacity-50">
            <div className="h-[1px] flex-1 bg-slate-700"></div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Config</span>
            <div className="h-[1px] flex-1 bg-slate-700"></div>
          </div>

          {/* Integrazione Sito */}
          <button onClick={() => setActiveTab('widget')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'widget' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            <span className="hidden sm:block truncate">Integrazione Sito</span>
          </button>

          {/* Impostazioni Base */}
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'settings' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            <span className="hidden sm:block truncate">Impostazioni</span>
          </button>
        </nav>

        <div className="px-3 sm:px-4 mt-auto space-y-3">
          <button onClick={handleSaveMenuClick} disabled={isSaving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-2 sm:px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-1 text-xs sm:text-sm disabled:opacity-50" title="Salva Menu">
            {isSaving ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            )}
            <span className="hidden sm:block">{isSaving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
          </button>
          {user && (
            <button onClick={() => router.push('/dashboard')} className="w-full text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 py-3 px-2 rounded-xl flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              <span className="hidden sm:block">Dashboard</span>
            </button>
          )}
        </div>
      </aside>

      {/* ----------- COLONNA 2: CONTENUTO EDITABILE ----------- */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-32 space-y-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'menu' && "Menu e Piatti"}
              {activeTab === 'design' && "Design e Colori"}
              {activeTab === 'settings' && "Impostazioni Generali"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'menu' && "Gestisci i piatti, traduci e crea da zero."}
              {activeTab === 'design' && "Scegli il template e personalizza i testi."}
              {activeTab === 'settings' && "Configura valuta, info ristorante e QR Code."}
            </p>
          </div>

          {activeTab === 'menu' && (
            <>
              {/* TRADUZIONE IA */}
              {items.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1 bg-fuchsia-500 rounded-full"></div>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Traduzioni IA (Gratis in Beta)</h2>
                  </div>
                  <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-3xl border border-fuchsia-100 p-5 sm:p-8 shadow-sm">
                    <div className="text-center max-w-xl mx-auto">
                      <div className="inline-block bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-md shadow-emerald-500/20">Esclusiva Sbloccata</div>
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 5 6-3 6 3 6-3v16l-6 3-6-3-6 3v-16Z" /><path d="M8 2v16" /><path d="M16 6v16" /></svg>
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
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
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
                              <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
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
                              placeholder="Categoria (es. Salads)"
                            />
                          </div>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                            className="text-sm text-slate-500 px-1 font-medium w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded outline-none transition-colors"
                            placeholder="Descrizione opzionale.."
                          />

                          {/* AVANZATE TOGGLE */}
                          <button
                            onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, showAdvanced: !i.showAdvanced } : i))}
                            className="mt-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 py-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${item.showAdvanced ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                            {item.showAdvanced ? 'Nascondi Opzioni Avanzate' : 'Mostra Opzioni Avanzate (Varianti, AI, Target...)'}
                          </button>

                          {item.showAdvanced && (
                            <div className="pt-3 pb-1 border-t border-slate-100 mt-2 space-y-4 animate-in fade-in slide-in-from-top-2">
                              {/* Area 1: Copy AI */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => generateCopy(item.id)}
                                  disabled={generatingCopyId === item.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-bold rounded-lg border border-violet-200 transition-all disabled:opacity-50"
                                >
                                  {generatingCopyId === item.id ? (
                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8l4-2" /><path d="M12 10l-4-2" /><circle cx="12" cy="18" r="4" /></svg>
                                  )}
                                  {generatingCopyId === item.id ? 'Generando...' : (item.description ? 'Migliora copy IA' : 'Genera copy IA')}
                                </button>
                              </div>
                              {/* TAG DIETETICI (Premium) */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm mr-1">Beta Free</span>
                                {DIETARY_OPTIONS.map(opt => {
                                  const tags = item.dietaryTags || [];
                                  const isActive = tags.includes(opt.id);
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => {
                                        const newTags = isActive ? tags.filter(t => t !== opt.id) : [...tags, opt.id];
                                        const updatedItems = items.map(i => i.id === item.id ? { ...i, dietaryTags: newTags } : i);
                                        setItems(updatedItems);
                                        processSaveMenu(updatedItems, null, true);
                                      }}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                    >
                                      <span>{opt.icon}</span> {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {/* BADGE / ETICHETTA PIATTO */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mr-1">Etichetta:</span>
                                {BADGE_OPTIONS.map(opt => {
                                  const isActive = item.badge === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => {
                                        const updatedItems = items.map(i => i.id === item.id ? { ...i, badge: isActive ? null : opt.id } : i);
                                        setItems(updatedItems);
                                      }}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${isActive ? opt.color : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {/* INGREDIENTI */}
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={item.ingredients || ''}
                                  onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, ingredients: e.target.value } : i))}
                                  className="text-[11px] text-slate-400 px-1 font-medium w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded outline-none transition-colors"
                                  placeholder="Ingredienti: es. farina, mozzarella, pomodoro, basilico..."
                                />
                              </div>
                              {/* VARIANTI PREZZO */}
                              <div className="mt-2">
                                {item.variants && item.variants.length > 0 && (
                                  <div className="space-y-1.5 mb-2">
                                    {item.variants.map((v, vi) => (
                                      <div key={vi} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={v.name}
                                          onChange={(e) => {
                                            const newVariants = [...item.variants];
                                            newVariants[vi] = { ...newVariants[vi], name: e.target.value };
                                            setItems(items.map(i => i.id === item.id ? { ...i, variants: newVariants } : i));
                                          }}
                                          className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-bold bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-amber-500"
                                          placeholder="Es. Piccola"
                                        />
                                        <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">{settings.currency || "€"}</span>
                                          <input
                                            type="number"
                                            step="0.50"
                                            value={v.price}
                                            onChange={(e) => {
                                              const newVariants = [...item.variants];
                                              newVariants[vi] = { ...newVariants[vi], price: parseFloat(e.target.value) || 0 };
                                              setItems(items.map(i => i.id === item.id ? { ...i, variants: newVariants } : i));
                                            }}
                                            className="w-20 pl-6 pr-2 py-1 border border-slate-200 rounded-lg text-[11px] font-bold bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-amber-500"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newVariants = item.variants.filter((_, idx) => idx !== vi);
                                            setItems(items.map(i => i.id === item.id ? { ...i, variants: newVariants } : i));
                                          }}
                                          className="text-rose-400 hover:text-rose-600 transition-colors p-0.5"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVariants = [...(item.variants || []), { name: '', price: 0 }];
                                    setItems(items.map(i => i.id === item.id ? { ...i, variants: newVariants } : i));
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-200 transition-all"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                  Aggiungi Variante (es. Piccola/Media/Grande)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0 border-slate-100">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{settings.currency || "€"}</span>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
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
                              onClick={() => setNewItem({ ...newItem, image: null })}
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
                          <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Es. Salad" />
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">CATEGORIA</label>
                        <input type="text" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Es. Sides" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">DESCRIZIONE</label>
                        <input type="text" value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Opzionale.." />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs font-bold text-slate-500 block mb-1">PREZZO ({settings.currency || "€"})</label>
                        <input type="number" step="0.50" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                      </div>
                      {/* AVANZATE TOGGLE per NEW ITEM */}
                      <div className="md:col-span-6">
                        <button
                          onClick={() => setNewItem({ ...newItem, showAdvanced: !newItem.showAdvanced })}
                          className="text-sm font-bold text-slate-500 hover:text-slate-700 flex items-center gap-2 py-2 w-full justify-center bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors shadow-sm mt-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${newItem.showAdvanced ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                          {newItem.showAdvanced ? 'Nascondi Opzioni Avanzate' : 'Mostra Opzioni Avanzate (Ingredienti, Badge, Tag, Varianti)'}
                        </button>
                      </div>
                      {newItem.showAdvanced && (
                        <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-5 gap-y-4 gap-x-6 border border-slate-100 rounded-2xl p-5 bg-white shadow-sm mt-2 animate-in fade-in slide-in-from-top-2">
                          <div className="md:col-span-5">
                            <label className="text-xs font-bold text-slate-500 block mb-1">TAG DIETETICI <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm ml-1">Beta Free</span></label>
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
                                      setNewItem({ ...newItem, dietaryTags: newTags });
                                    }}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                  >
                                    <span>{opt.icon}</span> {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="md:col-span-5">
                            <label className="text-xs font-bold text-slate-500 block mb-1">ETICHETTA PIATTO</label>
                            <div className="flex flex-wrap gap-1.5">
                              {BADGE_OPTIONS.map(opt => {
                                const isActive = newItem.badge === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setNewItem({ ...newItem, badge: isActive ? null : opt.id })}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${isActive ? opt.color : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="md:col-span-5">
                            <label className="text-xs font-bold text-slate-500 block mb-1">INGREDIENTI</label>
                            <input type="text" value={newItem.ingredients || ''} onChange={e => setNewItem({ ...newItem, ingredients: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Es. farina, mozzarella, pomodoro, basilico..." />
                          </div>
                          <div className="md:col-span-5">
                            <label className="text-xs font-bold text-slate-500 block mb-1">VARIANTI PREZZO <span className="text-slate-400 font-normal">(opzionale, es. Piccola/Media/Grande)</span></label>
                            {newItem.variants && newItem.variants.length > 0 && (
                              <div className="space-y-1.5 mb-2">
                                {newItem.variants.map((v, vi) => (
                                  <div key={vi} className="flex items-center gap-2">
                                    <input type="text" value={v.name} onChange={(e) => { const nv = [...newItem.variants]; nv[vi] = { ...nv[vi], name: e.target.value }; setNewItem({ ...newItem, variants: nv }); }} className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-amber-500" placeholder="Es. Piccola" />
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{settings.currency || "€"}</span>
                                      <input type="number" step="0.50" value={v.price} onChange={(e) => { const nv = [...newItem.variants]; nv[vi] = { ...nv[vi], price: parseFloat(e.target.value) || 0 }; setNewItem({ ...newItem, variants: nv }); }} className="w-24 pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm font-bold bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-amber-500" />
                                    </div>
                                    <button type="button" onClick={() => { const nv = newItem.variants.filter((_, idx) => idx !== vi); setNewItem({ ...newItem, variants: nv }); }} className="text-rose-400 hover:text-rose-600 transition-colors p-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button type="button" onClick={() => setNewItem({ ...newItem, variants: [...(newItem.variants || []), { name: '', price: 0 }] })} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold rounded-lg border border-amber-200 transition-all mt-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                              Aggiungi Variante
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="md:col-span-6 flex justify-end mt-2">
                        <button onClick={handleAddProduct} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors shadow-sm self-end">
                          Aggiungi Piatto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* NAVIGAZIONE A BLOCCHI E IMMAGINI CATEGORIA */}
              <section className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Navigazione a Blocchi</h2>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Mostra categorie a blocchi</h4>
                      <p className="text-sm text-slate-500 max-w-lg">Sostituisce il normale elenco del menù con una griglia visuale (effetto Card con foto) prima di mostrare i piatti.</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, blockCategories: !settings.blockCategories })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${settings.blockCategories ? 'bg-amber-500' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.blockCategories ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {settings.blockCategories && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                      {[...new Set(items.map(i => i.category).filter(Boolean))].map(cat => {
                        const catMeta = (settings.categoryMetadata || {})[cat] || {};
                        return (
                          <div key={cat} className="relative aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden group flex items-center justify-center shadow-sm">
                            {catMeta.image ? (
                              <img src={catMeta.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={cat} />
                            ) : (
                              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center px-2 z-10 w-full whitespace-normal leading-tight">Manca Foto<br />{cat}</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-20"></div>
                            <span className="absolute inset-x-2 bottom-4 text-white text-center font-black text-sm md:text-base tracking-tight drop-shadow-md truncate z-30">{cat}</span>
                            <input type="file" accept="image/*" id={`cat-img-${cat}`} className="hidden" onChange={(e) => handleUploadCategoryImage(e, cat)} />
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-40 bg-black/40 backdrop-blur-sm">
                              <button
                                onClick={() => document.getElementById(`cat-img-${cat}`).click()}
                                className="cursor-pointer bg-white text-slate-900 border border-slate-200 text-[10px] sm:text-xs font-black px-4 py-2 uppercase rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                              >
                                {catMeta.image ? 'Cambia' : 'Carica'}
                              </button>
                              {catMeta.image && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newMeta = { ...(settings.categoryMetadata || {}) };
                                    if (newMeta[cat]) newMeta[cat] = { ...newMeta[cat], image: null };
                                    setSettings({ ...settings, categoryMetadata: newMeta });
                                  }}
                                  className="cursor-pointer bg-rose-500 text-white border border-rose-600 text-[10px] sm:text-xs font-black px-4 py-2 uppercase rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
                                >
                                  Rimuovi
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {[...new Set(items.map(i => i.category).filter(Boolean))].length === 0 && (
                        <div className="col-span-2 md:col-span-4 text-sm text-slate-400 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center font-medium">Aggiungi prima dei piatti con categoria per poter associare le immagini.</div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'design' && (
            <>
              {/* SCELTA STILE */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 bg-pink-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Design Menù</h2>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Qual è l'atmosfera del tuo locale?</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">

                    {/* Elegant */}
                    <div
                      onClick={() => handleTemplateChange('elegant')}
                      className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${(!settings.template || settings.template === 'elegant') ? 'border-indigo-500 shadow-lg scale-[1.02] z-10' : 'border-slate-100 hover:border-indigo-200 opacity-70 hover:opacity-100'}`}
                    >
                      <div className="absolute inset-0 bg-[#0a0a0b] -z-10"></div>
                      <div className="w-10 h-10 mb-auto mt-4 rounded-full border border-[#c9a66b] flex items-center justify-center">
                        <span className="text-[#c9a66b] font-serif italic text-lg">E</span>
                      </div>
                      <h4 className="text-white font-serif tracking-widest text-sm uppercase mb-1">Elegant</h4>
                      <div className="h-0.5 w-6 bg-[#c9a66b]"></div>
                      {(!settings.template || settings.template === 'elegant') && <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Modern */}
                    <div
                      onClick={() => handleTemplateChange('modern')}
                      className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'modern' ? 'border-zinc-900 shadow-lg scale-[1.02] z-10' : 'border-slate-100 hover:border-zinc-300 opacity-70 hover:opacity-100'}`}
                    >
                      <div className="absolute inset-0 bg-white -z-10"></div>
                      <div className="absolute inset-0 border-[10px] border-zinc-100/50 -z-10"></div>
                      <div className="w-10 h-10 mb-auto mt-4 rounded border-2 border-zinc-900 flex items-center justify-center">
                        <span className="text-zinc-900 font-sans font-black text-lg">M</span>
                      </div>
                      <h4 className="text-zinc-900 font-sans font-black tracking-tighter text-sm uppercase mb-1">Modern</h4>
                      <div className="h-1 w-6 bg-zinc-900"></div>
                      {settings.template === 'modern' && <div className="absolute top-3 right-3 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Rustic */}
                    <div
                      onClick={() => handleTemplateChange('rustic')}
                      className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'rustic' ? 'border-[#d97757] shadow-lg scale-[1.02] z-10' : 'border-slate-100 hover:border-[#e8dbce] opacity-70 hover:opacity-100'}`}
                    >
                      <div className="absolute inset-0 bg-[#fdfbf7] -z-10"></div>
                      <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-[#e8dbce] rounded-full blur-xl -z-10"></div>
                      <div className="w-10 h-10 mb-auto mt-4 rounded-full border-2 border-dashed border-[#d97757] flex items-center justify-center">
                        <span className="text-[#2d241c] font-serif font-bold text-lg">R</span>
                      </div>
                      <h4 className="text-[#2d241c] font-serif font-bold text-sm capitalize mb-1">Rustic</h4>
                      <div className="h-0.5 border-t border-dashed border-[#d97757] w-8"></div>
                      {settings.template === 'rustic' && <div className="absolute top-3 right-3 w-6 h-6 bg-[#d97757] rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Cinematic (Premium) */}
                    <div
                      onClick={() => handleTemplateChange('cinematic')}
                      className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'cinematic' ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02] z-10' : 'border-slate-100 hover:border-amber-300 opacity-70 hover:opacity-100'}`}
                    >
                      <div className="absolute inset-0 bg-slate-950 -z-10"></div>
                      <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-amber-500/20 rounded-full blur-xl -z-10 animate-pulse"></div>
                      <div className="w-10 h-10 mb-auto mt-4 rounded-full bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-center">
                        <span className="text-amber-400 font-sans font-light text-lg">C</span>
                      </div>
                      <h4 className="text-white font-sans font-black tracking-widest text-sm uppercase mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Cinematic</h4>
                      <div className="h-px w-6 bg-amber-500/50"></div>
                      {settings.template === 'cinematic' && <div className="absolute top-3 left-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Vibrant */}
                    <div
                      onClick={() => handleTemplateChange('vibrant')}
                      className={`isolate relative cursor-pointer rounded-2xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'vibrant' ? 'border-slate-900 shadow-[6px_6px_0px_#fde047] scale-[1.02] -translate-y-1 z-10' : 'border-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100'}`}
                    >
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">Gratis in Beta</span>
                      <div className="absolute inset-0 bg-pink-50 -z-10"></div>
                      <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-yellow-400 rounded-full -z-10"></div>
                      <div className="w-12 h-10 mb-auto mt-4 bg-blue-600 rounded-xl transform -rotate-6 flex items-center justify-center shadow-sm border border-blue-700">
                        <span className="text-white font-sans font-black text-lg">V</span>
                      </div>
                      <h4 className="text-slate-900 font-sans font-black tracking-tighter text-sm uppercase mb-1">Vibrant</h4>
                      <div className="h-1.5 w-6 bg-slate-900 rounded-full"></div>
                      {settings.template === 'vibrant' && <div className="absolute top-3 right-3 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Luxury (Premium) */}
                    <div
                      onClick={() => handleTemplateChange('luxury')}
                      className={`isolate relative cursor-pointer rounded-2xl border-[3px] transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 ${settings.template === 'luxury' ? 'border-stone-800 shadow-2xl scale-[1.02] z-10' : 'border-slate-200 hover:border-stone-400 opacity-70 hover:opacity-100'}`}
                    >
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">Gratis in Beta</span>
                      <div className="absolute inset-0 bg-stone-100 -z-10"></div>
                      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-stone-200 to-transparent -z-10"></div>
                      <div className="w-10 h-14 mb-auto mt-2 border border-stone-800 flex items-center justify-center bg-transparent">
                        <span className="text-stone-800 font-serif text-xl">L</span>
                      </div>
                      <h4 className="text-stone-800 font-serif tracking-widest text-sm uppercase mb-1">Luxury</h4>
                      <div className="h-[1px] w-6 bg-stone-800"></div>
                      {settings.template === 'luxury' && <div className="absolute top-3 left-3 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Sushi (New Dark) */}
                    <div
                      onClick={() => handleTemplateChange('sushi')}
                      className={`isolate relative cursor-pointer rounded-2xl border-[3px] transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 bg-[#020617] ${settings.template === 'sushi' ? 'border-emerald-500 shadow-2xl scale-[1.02] z-10' : 'border-slate-800 hover:border-emerald-900 opacity-70 hover:opacity-100'}`}
                    >
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">New</span>
                      <div className="w-10 h-10 mb-auto mt-4 rounded-full border border-emerald-500/30 flex items-center justify-center bg-slate-900 shadow-inner overflow-hidden">
                        <span className="text-emerald-500 font-mono font-black text-lg">S</span>
                      </div>
                      <h4 className="text-white font-mono tracking-widest text-sm uppercase mb-1 drop-shadow-md">Sushi</h4>
                      <div className="h-[2px] w-6 bg-emerald-500/50"></div>
                      {settings.template === 'sushi' && <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    </div>

                    {/* Taverna (New Vintage) */}
                    <div
                      onClick={() => handleTemplateChange('taverna')}
                      className={`isolate relative cursor-pointer rounded-2xl border-[3px] transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 bg-[#0a0a0b] ${settings.template === 'taverna' ? 'border-[#c9a66b] shadow-2xl scale-[1.02] z-10' : 'border-[#1a1a1c] hover:border-[#332e29] opacity-70 hover:opacity-100'}`}
                    >
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">New</span>
                      <div className="w-10 h-10 mb-auto mt-4 rounded-full flex items-center justify-center bg-transparent border-t border-b border-[#c9a66b]">
                        <span className="text-[#c9a66b] font-serif font-light text-xl">T</span>
                      </div>
                      <h4 className="text-white font-serif tracking-[0.2em] text-xs uppercase mb-1 drop-shadow-md z-10">Taverna</h4>
                      <div className="h-[1px] w-6 bg-[#c9a66b] opacity-50"></div>
                      {settings.template === 'taverna' && <div className="absolute top-3 left-3 w-6 h-6 bg-[#c9a66b] rounded-full flex items-center justify-center text-[#0a0a0b]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#c9a66b]/10 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Brunch (New Clean) */}
                    <div
                      onClick={() => handleTemplateChange('brunch')}
                      className={`isolate relative cursor-pointer rounded-3xl border-2 transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 bg-[#f8f9fa] ${settings.template === 'brunch' ? 'border-emerald-600 shadow-[0_10px_30px_rgba(5,150,105,0.2)] scale-[1.02] z-10' : 'border-slate-100 hover:border-emerald-200 opacity-70 hover:opacity-100'}`}
                    >
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">New</span>
                      <div className="w-16 h-8 mb-auto mt-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-50">
                        <span className="text-slate-900 font-sans font-black text-sm uppercase tracking-wider">B</span>
                      </div>
                      <h4 className="text-slate-800 font-sans font-black tracking-widest text-sm uppercase mb-1">Brunch</h4>
                      <div className="h-1 w-6 rounded-full bg-emerald-600"></div>
                      {settings.template === 'brunch' && <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
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
                          ],
                          sushi: [
                            { id: 'default', name: 'Emerald', hex: '#10b981' },
                            { id: 'ruby', name: 'Ruby', hex: '#e11d48' },
                            { id: 'gold', name: 'Gold', hex: '#fbbf24' }
                          ],
                          taverna: [
                            { id: 'default', name: 'Gold', hex: '#c9a66b' },
                            { id: 'silver', name: 'Silver', hex: '#94a3b8' },
                            { id: 'copper', name: 'Copper', hex: '#b45309' }
                          ],
                          brunch: [
                            { id: 'default', name: 'Emerald', hex: '#059669' },
                            { id: 'rose', name: 'Rose', hex: '#e11d48' },
                            { id: 'ocean', name: 'Ocean', hex: '#0284c7' }
                          ]
                        };
                        const activePalettes = palettes[currTemplate] || palettes.elegant;
                        const activePaletteId = settings.palette || 'default';

                        return activePalettes.map(pal => (
                          <button
                            key={pal.id}
                            onClick={() => setSettings({ ...settings, palette: pal.id })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${activePaletteId === pal.id ? 'border-slate-900 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'}`}
                          >
                            <span className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: pal.hex }}></span>
                            <span className={`text-sm font-bold ${activePaletteId === pal.id ? 'text-slate-900' : 'text-slate-600'}`}>{pal.name}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  </div>


                </div>
              </section>
            </>
          )}

          {activeTab === 'upsell' && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Upselling & Promozioni</h2>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm flex flex-col gap-6">
                <p className="text-slate-500 text-sm">Aumenta lo scontrino medio proponendo in automatico abbinamenti perfetti ai tuoi clienti (es. un vino specifico con una bistecca, o delle patatine con una pizza).</p>

                {items.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm">Aggiungi prima dei piatti al tuo menù.</div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">1. Scegli un piatto da configurare</label>
                      <select
                        value={selectedUpsellItemId || ''}
                        onChange={(e) => setSelectedUpsellItemId(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      >
                        <option value="" disabled>-- Seleziona un piatto --</option>
                        {items.map(i => (
                          <option key={i.id} value={i.id}>{i.name} ({i.category})</option>
                        ))}
                      </select>
                    </div>

                    {selectedUpsellItemId && (
                      <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
                        <label className="text-sm font-bold text-slate-700">2. Seleziona i piatti da suggerire in abbinamento</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                          {items.filter(i => i.id !== selectedUpsellItemId).map(suggestedItem => {
                            const baseItem = items.find(i => i.id === selectedUpsellItemId);
                            const isChecked = baseItem?.suggestedItems?.includes(suggestedItem.id);

                            return (
                              <label key={suggestedItem.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked || false}
                                  className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                                  onChange={(e) => {
                                    setItems(prevItems => prevItems.map(item => {
                                      if (item.id === selectedUpsellItemId) {
                                        const currentSuggestions = item.suggestedItems || [];
                                        if (e.target.checked) {
                                          return { ...item, suggestedItems: [...currentSuggestions, suggestedItem.id] };
                                        } else {
                                          return { ...item, suggestedItems: currentSuggestions.filter(id => id !== suggestedItem.id) };
                                        }
                                      }
                                      return item;
                                    }));
                                  }}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-sm font-bold truncate ${isChecked ? 'text-amber-900' : 'text-slate-700'}`}>{suggestedItem.name}</span>
                                  <span className="text-xs text-slate-400 truncate">{suggestedItem.category}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'typography' && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tipografia</h2>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
                <p className="text-slate-500 text-sm mb-6">Personalizza il font principale del tuo menù scegliendo tra una selezione di font studiati per la leggibilità e l'estetica.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 'inter', name: 'Inter', desc: 'Moderno, Pulito, Perfetto per ogni uso' },
                    { id: 'playfair', name: 'Playfair Display', desc: 'Elegante, Classico, Ideale per ristoranti storici' },
                    { id: 'space', name: 'Space Mono', desc: 'Tecnico, Minimale, Ottimo per posti moderni' },
                    { id: 'outfit', name: 'Outfit', desc: 'Geometrico, Fresco e Accogliente' },
                    { id: 'quicksand', name: 'Quicksand', desc: 'Arrotondato, Amichevole, Caldo' }
                  ].map(f => {
                    const isActive = (settings.fontFamily || 'inter') === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => { setSettings({ ...settings, fontFamily: f.id }); setUserHasCustomFont(true); }}
                        className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${isActive ? 'border-amber-500 bg-amber-50 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'}`}
                        style={{ fontFamily: `var(--font-${f.id})` }}
                      >
                        <span className={`text-lg font-bold ${isActive ? 'text-amber-900' : 'text-slate-800'}`}>{f.name}</span>
                        <span className="text-xs text-slate-500 opacity-80">{f.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'widget' && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Integrazione Sito & Export</h2>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm flex flex-col gap-8">

                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-slate-800 text-lg">Sito Personalizzato (Opzionale)</h3>
                  <p className="text-sm text-slate-500">
                    Inserisci qui il tuo sito se vuoi che il QR Code o i link vi indirizzino direttamente.
                    <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 hover:underline ml-1">
                      Docs API <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    </a>
                  </p>
                  <input
                    type="text"
                    name="customUrl"
                    value={settings.customUrl || ''}
                    onChange={handleSettingsChange}
                    className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="es. pizzeriamario.it/menu"
                  />
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-slate-800 text-lg">Widget Sito Web</h3>
                  <p className="text-slate-500 text-sm">Copia e incolla questo codice all'interno del tuo sito web (WordPress, Wix, HTML personalizzato) per mostrare il tuo menù interattivo direttamente sulla tua pagina.</p>

                  <div className="relative mt-2">
                    <pre className="bg-slate-900 text-teal-400 p-4 rounded-xl text-xs overflow-x-auto font-mono scrollbar-hide">
                      {`<iframe \n  src="https://smartmenu-ai.com/${restaurantId}" \n  width="100%" \n  height="800px" \n  style="border:none; border-radius:12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" \n  title="Menu Digitale"\n></iframe>`}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="https://smartmenu-ai.com/${restaurantId}" width="100%" height="800px" style="border:none; border-radius:12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" title="Menu Digitale"></iframe>`);
                        toast.success("Codice copiato negli appunti!");
                      }}
                      className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all backdrop-blur-md"
                    >
                      Copia Codice
                    </button>
                  </div>
                </div>

              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Setup Ristorante</h2>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col h-full md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 block mb-2">Nome Ristorante</label>
                      <input
                        type="text"
                        name="restaurantName"
                        value={settings.restaurantName}
                        onChange={handleSettingsChange}
                        className="w-full mt-auto px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-md font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col pt-6 border-t border-slate-100">
                      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="w-full md:w-1/2 flex flex-col h-full">
                          <label className="text-sm font-bold text-slate-700 block mb-1">Prezzo Coperto (Opzionale)</label>
                          <p className="text-xs text-slate-500 mb-3">Se indicato, apparirà in fondo al tuo menù digitale come costo del servizio.</p>
                          <div className="relative mt-auto">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{settings.currency || "€"}</span>
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
                            <span>White-Label <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm ml-2">Gratis in Beta</span></span>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input type="checkbox" className="sr-only peer" checked={settings.whiteLabel || false} onChange={(e) => setSettings({ ...settings, whiteLabel: e.target.checked })} />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                          </label>
                          <p className="text-xs text-slate-500 mt-2">Rimuove il marchio "Powered by SmartMenu AI" in fondo alla pagina per un'esperienza 100% dedicata al tuo brand.</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col md:flex-row gap-8 items-start justify-between">
                        {/* VALUTA */}
                        <div className="w-full md:w-1/3 flex flex-col h-full">
                          <label className="text-sm font-bold text-slate-700 block mb-1">Valuta</label>
                          <p className="text-xs text-slate-500 mb-3">Scegli la valuta per i prezzi.</p>
                          <div className="relative mt-auto">
                            <select
                              name="currency"
                              value={settings.currency || "€"}
                              onChange={handleSettingsChange}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white text-md font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all cursor-pointer appearance-none"
                            >
                              <option value="€">EUR (€)</option>
                              <option value="$">USD ($)</option>
                              <option value="£">GBP (£)</option>
                              <option value="CHF">CHF</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                          </div>
                        </div>

                        {/* TRIPADVISOR */}
                        <div className="w-full md:w-2/3 md:border-l border-slate-100 md:pl-8 flex flex-col h-full">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                            Link Recensioni TripAdvisor
                            <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Gratis in Beta</span>
                          </label>
                          <p className="text-xs text-slate-500 mb-3">Inserisci il link alla pagina TripAdvisor. I clienti potranno lasciare una recensione direttamente.</p>
                          <input
                            type="url"
                            name="tripadvisorUrl"
                            value={settings.tripadvisorUrl || ''}
                            onChange={handleSettingsChange}
                            className="w-full mt-auto px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            placeholder="https://www.tripadvisor.it/Restaurant_Review-..."
                          />
                        </div>
                      </div>

                      {/* TESTI PERSONALIZZATI (BETA) */}
                      <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col gap-6">
                        <div className="flex flex-col">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                            Testi Personalizzati Template
                            <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Gratis in Beta</span>
                          </label>
                          <p className="text-xs text-slate-500 mb-4">Sostituisci i testi pre-impostati che appaiono in base al template (come gli slogan in alto o i saluti finali). Lascia vuoto per usare il testo predefinito.</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-slate-600 mb-1">Frase in Alto (Sottotitolo/Slogan)</label>
                              <input
                                type="text"
                                name="customHeader"
                                value={settings.customHeader || ''}
                                onChange={handleSettingsChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-300"
                                placeholder="es. Dal 1956, Healthy & Organic..."
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-slate-600 mb-1">Frase in Basso (Ringraziamenti/Saluti)</label>
                              <input
                                type="text"
                                name="customFooter"
                                value={settings.customFooter || ''}
                                onChange={handleSettingsChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-slate-300"
                                placeholder="es. Buon Appetito, Fatto con Amore..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ordina dal Menu */}
                      <div className="border-t border-slate-100 pt-6 mt-6 opacity-75">
                        <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2 mb-1">
                          <span>Funzione Ordina <span className="text-[9px] bg-slate-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm ml-2">In Manutenzione</span></span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 opacity-50">
                            <input type="checkbox" disabled className="sr-only peer" checked={settings.enableOrdering || false} onChange={(e) => setSettings({ ...settings, enableOrdering: e.target.checked })} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </label>
                        <p className="text-xs text-slate-500 mt-2">Permette ai clienti di aggiungere piatti al carrello. <strong>Attualmente sospesa per integrazione nuovo sistema pagamenti.</strong></p>

                        {settings.enableOrdering && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm font-bold text-rose-600 mb-2">Integrazione Pagamenti in Corso</p>
                            <p className="text-xs text-slate-600">
                              Per garantirti la massima sicurezza e rispettare le nuove normative fiscali, l'integrazione per incassare
                              soldi direttamente dai clienti tramite carta o Apple Pay è temporaneamente sospesa in attesa di sblocco.
                            </p>
                          </div>
                        )}
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                        Anteprima Live
                      </button>
                      <button
                        onClick={async () => {
                          if (settings.blockCategories) {
                            setShowPdfWarning(true);
                          } else {
                            await processSaveMenu(null, null, true);
                            window.open(`/${restaurantId}?print=true`, '_blank');
                          }
                        }}
                        className="bg-white border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700 font-bold py-4 px-6 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 flex-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                        Esporta PDF
                      </button>
                      <button
                        onClick={handleSaveMenuClick}
                        disabled={isSaving}
                        className="flex-[1.5] bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        )}
                        {isSaving ? 'Salvataggio...' : 'Crea Menù'}
                      </button>
                    </div>

                  </div>
                </section>
              )}
            </>
          )}

        </div>
      </main>

      {/* ----------- COLONNA 3: PREVIEW FISSA (Solo Desktop) ----------- */}
      <aside className="hidden lg:flex w-[400px] xl:w-[450px] bg-slate-200/50 border-l border-slate-200 flex-shrink-0 relative flex-col items-center justify-center p-4">
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Live Preview</span>
        </div>
        <div className="text-center mb-6 mt-12 w-full max-w-[320px]">
          <p className="text-xs text-slate-400 font-medium tracking-wide">La versione reale su un dispositivo mobile potrebbe variare leggermente.</p>
        </div>
        <div className="relative bg-slate-950 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-[12px] border-slate-800 transition-all origin-center overflow-hidden flex flex-col" style={{ width: 360, height: 740, transform: 'scale(0.85)' }}>
          <div className="h-6 border-b border-slate-800 flex items-center justify-center px-5 shrink-0 z-50 bg-slate-950">
            <div className="w-16 h-3 bg-slate-900 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <div className="flex-1 relative w-full bg-slate-50">
            <iframe ref={desktopIframeRef} src="/preview" className="w-full h-full border-0 absolute inset-0 bg-slate-50" title="Live Preview Simulator" />
          </div>
        </div>
      </aside>

      {/* FAB Mobile Preview */}
      <button onClick={() => setShowPreview(true)} className="lg:hidden fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 z-30 transition-transform active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
      </button>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center border border-slate-100">

            {/* Tasto Chiudi */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            {/* Icona Successo */}
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </a>

              {/* Bottone Scarica QR Code */}
              <button
                onClick={handleDownloadQR}
                className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
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
      {/* PDF WARNING MODAL POPUP */}
      {showPdfWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center border border-slate-100">

            <button
              onClick={() => setShowPdfWarning(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Attenzione</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              La Navigazione a Blocchi è attiva. Per l'esportazione in PDF il menu verrà mostrato in formato lineare. Vuoi continuare comunque?
            </p>

            <div className="space-y-3 w-full">
              <button
                onClick={async () => {
                  setShowPdfWarning(false);
                  await processSaveMenu(null, null, true);
                  window.open(`/${restaurantId}?print=true`, '_blank');
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-wider py-4 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
              >
                Continua comunque
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
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 relative w-full bg-slate-50">
              <iframe
                ref={mobileIframeRef}
                src="/preview"
                className="w-full h-full border-0 absolute inset-0 bg-slate-50 transition-opacity duration-300"
                title="Live Preview Simulator"
              />
            </div>
          </div>

          {/* BOTTONE CHIUDI X SCREEN GRANDE */}
          <button onClick={() => setShowPreview(false)} className="hidden md:flex absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-full items-center gap-1 shadow-lg border border-white/10 backdrop-blur-sm z-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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
