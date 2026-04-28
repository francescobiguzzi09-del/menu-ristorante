'use client';
import { useState } from 'react';

const DIETARY_OPTIONS = [
  { id: 'glutenFree', label: 'Senza Glutine', icon: '🌾' },
  { id: 'lactoseFree', label: 'Senza Lattosio', icon: '🥛' },
  { id: 'vegetarian', label: 'Vegetariano', icon: '🥬' },
  { id: 'vegan', label: 'Vegano', icon: '🌱' },
  { id: 'nutFree', label: 'Senza Frutta a Guscio', icon: '🥜' },
];
const BADGE_OPTIONS = [
  { id: 'new', label: 'Novità', color: 'bg-emerald-500 text-white' },
  { id: 'bestseller', label: 'Best Seller', color: 'bg-amber-500 text-white' },
  { id: 'chef', label: 'Consigliato', color: 'bg-[#C4622D] text-white' },
  { id: 'spicy', label: 'Piccante', color: 'bg-rose-500 text-white' },
];

export default function NewDishModal({ isOpen, onClose, onAdd, categories, settings }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: categories[0] || '', image: null, dietaryTags: [], badge: null, ingredients: '', variants: [] });

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert("Immagine troppo grande (max 500KB)"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    onAdd({
      id: 'manual-' + Date.now() + Math.random().toString(36).substring(7),
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category || 'Senza Categoria',
      image: form.image,
      dietaryTags: form.dietaryTags,
      badge: form.badge,
      ingredients: form.ingredients,
      variants: form.variants.length > 0 ? form.variants : [],
    });
    setForm({ name: '', description: '', price: '', category: form.category, image: null, dietaryTags: [], badge: null, ingredients: '', variants: [] });
    onClose();
  };

  const currency = settings?.currency || '€';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 rounded-t-3xl z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Nuovo Piatto</h3>
            <p className="text-sm text-slate-500 mt-0.5">Modifica i dettagli del piatto qui sotto.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nome</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome del piatto" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C4622D] focus:border-transparent outline-none" />
          </div>

          {/* Descrizione */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Descrizione</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descrizione (opzionale)" rows={3} maxLength={130} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C4622D] focus:border-transparent outline-none resize-none" />
            <p className="text-right text-xs text-slate-400 mt-1">{(form.description||'').length} / 130</p>
          </div>

          {/* Immagine */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Immagine</label>
            <div className="flex items-start gap-4">
              <div onClick={() => document.getElementById('ndm-img').click()} className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[#C4622D] flex items-center justify-center cursor-pointer transition-colors overflow-hidden shrink-0">
                {form.image ? <img src={form.image} className="w-full h-full object-cover" alt="" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M5 12h14"/><path d="M12 5v14"/></svg>}
              </div>
              <input type="file" id="ndm-img" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <p className="text-xs text-slate-400 leading-relaxed">Clicca sull&apos;immagine per caricare la tua foto. Max 500KB.</p>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Categoria</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-fit px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-[#C4622D] outline-none">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="">+ Nuova categoria</option>
            </select>
            {form.category === '' && <input type="text" placeholder="Nome nuova categoria" onChange={e => setForm({...form, category: e.target.value})} className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C4622D]" />}
          </div>

          {/* Prezzo + Varianti */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prezzo</label>
              <div className="relative">
                <input type="number" step="0.50" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" className="w-full pl-4 pr-16 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#C4622D] outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">{currency}</span>
              </div>
            </div>
            <button type="button" onClick={() => setForm({...form, variants: [...form.variants, {name:'', price:0}]})} className="px-3 py-3 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors whitespace-nowrap">+ Variante</button>
          </div>
          {form.variants.length > 0 && (
            <div className="space-y-2 pl-2 border-l-2 border-amber-200">
              {form.variants.map((v,i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={v.name} onChange={e => { const nv=[...form.variants]; nv[i]={...nv[i],name:e.target.value}; setForm({...form,variants:nv}); }} placeholder="Es. Piccola" className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-amber-500" />
                  <input type="number" step="0.50" value={v.price} onChange={e => { const nv=[...form.variants]; nv[i]={...nv[i],price:parseFloat(e.target.value)||0}; setForm({...form,variants:nv}); }} className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-amber-500" />
                  <button onClick={() => setForm({...form, variants: form.variants.filter((_,idx)=>idx!==i)})} className="text-rose-400 hover:text-rose-600 p-1">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Allergeni */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Allergeni / Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map(opt => {
                const active = (form.dietaryTags||[]).includes(opt.id);
                return <button key={opt.id} type="button" onClick={() => { const t = active ? form.dietaryTags.filter(x=>x!==opt.id) : [...(form.dietaryTags||[]), opt.id]; setForm({...form, dietaryTags:t}); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? 'bg-teal-50 text-teal-700 border-teal-200':'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>{opt.icon} {opt.label}</button>;
              })}
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Etichetta</label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map(opt => <button key={opt.id} type="button" onClick={() => setForm({...form, badge: form.badge===opt.id?null:opt.id})} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.badge===opt.id ? opt.color+' border-transparent':'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>{opt.label}</button>)}
            </div>
          </div>

          {/* Ingredienti */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ingredienti</label>
            <input type="text" value={form.ingredients||''} onChange={e=>setForm({...form,ingredients:e.target.value})} placeholder="Es. farina, mozzarella, pomodoro..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C4622D]" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 rounded-b-3xl flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Annulla</button>
          <button onClick={handleSubmit} disabled={!form.name||!form.price} className="flex-1 py-3 px-4 bg-[#2D2016] text-[#F5F0E8] font-bold rounded-xl text-sm hover:bg-black transition-colors disabled:opacity-40">Aggiungi Piatto</button>
        </div>
      </div>
    </div>
  );
}
