"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import QRCode from 'react-qr-code';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  const [isSaving, setIsSaving] = useState(false);
  
  // Stato per la modale di successo
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const fileInputRef = useRef(null);
  
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Salads', image: null });

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

  const handleSaveMenu = async () => {
    if (!restaurantId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurantId,
          data: { settings, menu: items },
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
      image: newItem.image
    };
    setItems([...items, product]);
    setNewItem({ name: '', description: '', price: '', category: 'Salads', image: null });
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
        <div className="bg-gradient-to-r from-amber-100 to-orange-50 border-b border-amber-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left z-10 relative">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Stai usando l'App come <strong className="font-black">Ospite</strong>. Se perdi il link o svuoti il browser perderai il tuo lavoro.</span>
          </div>
          <button onClick={() => router.push('/login')} className="bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all whitespace-nowrap border border-amber-600/20">
            Crea Account Gratis
          </button>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        
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
                <label className="text-sm font-bold text-slate-700 block mb-1">Prezzo Coperto (Opzionale)</label>
                <p className="text-xs text-slate-500 mb-3">Se indicato, apparirà in fondo al tuo menù digitale come costo del servizio.</p>
                <div className="relative md:w-1/2 mt-auto">
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
            </div>
          </div>
        </section>

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

                <button 
                  onClick={handleSaveMenu}
                  disabled={isSaving}
                  className="w-full max-w-md bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-lg py-5 px-8 rounded-2xl transition-all shadow-xl shadow-slate-900/20 mb-10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? (
                     <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  )}
                  {isSaving ? 'Generazione in corso...' : 'GENERA MENÙ DEFINITIVO'}
                </button>

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
