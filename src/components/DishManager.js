'use client';
import { useState, useMemo } from 'react';
import NewDishModal from './NewDishModal';

export default function DishManager({ items, setItems, settings, processSaveMenu, enhanceImage, enhancingItemId, generateCopy, generatingCopyId, triggerItemImageUpload, handleItemImageUpload }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCats, setCollapsedCats] = useState({});
  const [expandedDish, setExpandedDish] = useState(null);
  const [showNewDishModal, setShowNewDishModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'dish'|'category', id, name }

  const currency = settings?.currency || '€';

  // Categorie uniche
  const categories = useMemo(() => {
    const cats = [];
    items.forEach(item => {
      if (item.category && !cats.includes(item.category)) cats.push(item.category);
    });
    return cats;
  }, [items]);

  // Filtra per ricerca
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => i.name?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Raggruppa per categoria
  const grouped = useMemo(() => {
    const map = {};
    filteredItems.forEach(item => {
      const cat = item.category || 'Senza Categoria';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [filteredItems]);

  const toggleCollapse = (cat) => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  const toggleDisableItem = (id) => setItems(items.map(i => i.id === id ? { ...i, disabled: !i.disabled } : i));
  const toggleDisableCat = (cat) => {
    const catItems = items.filter(i => i.category === cat);
    const allDisabled = catItems.every(i => i.disabled);
    setItems(items.map(i => i.category === cat ? { ...i, disabled: !allDisabled } : i));
  };
  const handleDelete = (id) => setItems(items.filter(i => i.id !== id));
  const handleDeleteCat = (cat) => setItems(items.filter(i => i.category !== cat));
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'dish') handleDelete(deleteConfirm.id);
    else if (deleteConfirm.type === 'category') handleDeleteCat(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleAddDish = (dish) => setItems([...items, dish]);
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    // Add a placeholder item to create the category
    const placeholder = {
      id: 'cat-' + Date.now() + Math.random().toString(36).substring(7),
      name: 'Nuovo piatto',
      description: '',
      price: 0,
      category: newCatName.trim(),
      disabled: false,
    };
    setItems([...items, placeholder]);
    setNewCatName('');
    setShowNewCatInput(false);
  };

  // Drag handlers
  const onDragStart = (e, itemId) => { setDragItem(itemId); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDropOnItem = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem === targetId) return;
    const newItems = [...items];
    const dragIdx = newItems.findIndex(i => i.id === dragItem);
    const dropIdx = newItems.findIndex(i => i.id === targetId);
    if (dragIdx < 0 || dropIdx < 0) return;
    const moved = newItems[dragIdx];
    // Update category if dropping into a different category
    const targetCat = newItems[dropIdx].category;
    moved.category = targetCat;
    newItems.splice(dragIdx, 1);
    // Recalculate drop index after removal
    const newDropIdx = newItems.findIndex(i => i.id === targetId);
    newItems.splice(newDropIdx, 0, moved);
    setItems(newItems);
    setDragItem(null);
  };
  const onDropOnCat = (e, cat) => {
    e.preventDefault();
    if (!dragItem) return;
    // Move item to end of category
    const newItems = items.filter(i => i.id !== dragItem);
    const moved = items.find(i => i.id === dragItem);
    if (!moved) return;
    moved.category = cat;
    // Find last item of this category and insert after it
    const lastCatIdx = newItems.reduce((acc, item, idx) => item.category === cat ? idx : acc, -1);
    newItems.splice(lastCatIdx + 1, 0, moved);
    setItems(newItems);
    setDragItem(null);
  };

  const isCatDisabled = (cat) => {
    const catItems = items.filter(i => i.category === cat);
    return catItems.length > 0 && catItems.every(i => i.disabled);
  };

  const collapseAll = () => {
    const all = {};
    categories.forEach(c => all[c] = true);
    setCollapsedCats(all);
  };
  const expandAll = () => setCollapsedCats({});

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-1 bg-teal-500 rounded-full"></div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Gestione Piatti ({items.length})</h2>
      </div>

      <div className="bg-white rounded-3xl border border-[#2D2016]/10 shadow-sm overflow-hidden">
        {/* Toolbar: Ricerca + Azioni */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Barra ricerca (punto 9) */}
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Cerca piatti per nome..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={collapseAll} className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors" title="Comprimi tutte le categorie">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 20 5-5 5 5"/><path d="m7 4 5 5 5-5"/></svg>
            </button>
            <button onClick={expandAll} className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors" title="Espandi tutte">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
            </button>
          </div>
        </div>

        {/* Lista categorie + piatti */}
        {Object.keys(grouped).length === 0 && items.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl opacity-50 grayscale">🍽️</span></div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Il menù è vuoto</h3>
            <p className="text-slate-500 text-sm">Aggiungi il tuo primo piatto per iniziare.</p>
          </div>
        )}
        {Object.keys(grouped).length === 0 && items.length > 0 && searchQuery && (
          <div className="p-12 text-center text-sm text-slate-400">Nessun risultato per &quot;{searchQuery}&quot;</div>
        )}

        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} onDragOver={onDragOver} onDrop={e => onDropOnCat(e, cat)} className="border-b border-slate-100 last:border-b-0">
            {/* Category header */}
            <div className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none transition-colors ${isCatDisabled(cat) ? 'bg-slate-50 opacity-60' : 'hover:bg-[#FAF8F5]'}`} onClick={() => toggleCollapse(cat)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform shrink-0 ${collapsedCats[cat] ? '-rotate-90' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              <h3 className="text-sm font-bold text-slate-900 flex-1 uppercase tracking-wider">{cat}</h3>
              <span className="text-xs text-slate-400 font-medium">{catItems.length} {catItems.length === 1 ? 'piatto' : 'piatti'}</span>
              {/* Toggle categoria */}
              <button onClick={e => { e.stopPropagation(); toggleDisableCat(cat); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${isCatDisabled(cat) ? 'bg-slate-200' : 'bg-teal-500'}`} title={isCatDisabled(cat) ? 'Abilita categoria' : 'Disabilita categoria'}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isCatDisabled(cat) ? 'translate-x-1' : 'translate-x-6'}`} />
              </button>
              {/* Elimina categoria */}
              <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'category', id: cat, name: cat }); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Elimina categoria">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>

            {/* Piatti dentro la categoria (collapsible - punto 10) */}
            {!collapsedCats[cat] && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                {catItems.map(item => (
                  <div key={item.id} draggable onDragStart={e => onDragStart(e, item.id)} onDragOver={onDragOver} onDrop={e => onDropOnItem(e, item.id)}
                    className={`border-t border-slate-50 transition-colors ${item.disabled ? 'opacity-40' : ''} ${dragItem === item.id ? 'bg-teal-50/50' : ''}`}>
                    {/* Riga compatta piatto */}
                    <div className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#FAF8F5]/50 transition-colors" onClick={() => setExpandedDish(expandedDish === item.id ? null : item.id)}>
                      {/* Drag handle */}
                      <div className="text-slate-300 cursor-grab shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                      </div>
                      {/* Nome piatto */}
                      <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{item.name}</span>
                      {/* Prezzo */}
                      <span className="text-sm font-bold text-slate-600 shrink-0">
                        {item.variants?.length > 0 ? `da ${Math.min(...item.variants.map(v=>v.price)).toFixed(2)}` : (item.price||0).toFixed(2)} {currency}
                      </span>
                      {/* Thumbnail */}
                      {item.image && <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100"><img src={item.image} className="w-full h-full object-cover" alt="" /></div>}
                      {/* Toggle piatto */}
                      <button onClick={e => { e.stopPropagation(); toggleDisableItem(item.id); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${item.disabled ? 'bg-slate-200' : 'bg-teal-500'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${item.disabled ? 'translate-x-1' : 'translate-x-6'}`} />
                      </button>
                      {/* Elimina piatto */}
                      <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'dish', id: item.id, name: item.name }); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors shrink-0" title="Elimina piatto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>

                    {/* Dettagli espansi (punto 8 - click per vedere) */}
                    {expandedDish === item.id && (
                      <div className="px-5 pb-5 pt-2 bg-[#FAF8F5]/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">NOME</label>
                            <input type="text" value={item.name} onChange={e => setItems(items.map(i => i.id===item.id ? {...i, name:e.target.value}:i))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">PREZZO ({currency})</label>
                            <input type="number" step="0.50" value={item.price} onChange={e => setItems(items.map(i => i.id===item.id ? {...i, price:parseFloat(e.target.value)||0}:i))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">DESCRIZIONE</label>
                          <input type="text" value={item.description||''} onChange={e => setItems(items.map(i => i.id===item.id ? {...i, description:e.target.value}:i))} placeholder="Descrizione opzionale..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">CATEGORIA</label>
                          <input type="text" value={item.category||''} onChange={e => setItems(items.map(i => i.id===item.id ? {...i, category:e.target.value}:i))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        {/* Foto */}
                        <div className="flex items-center gap-3">
                          <div onClick={() => triggerItemImageUpload(item.id)} className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-teal-500 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition-colors">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <span className="text-slate-400 text-lg">📸</span>}
                          </div>
                          <input type="file" accept="image/*" id={`upload-image-${item.id}`} className="hidden" onChange={e => handleItemImageUpload(e, item.id)} />
                          {item.image && <button onClick={() => setItems(items.map(i => i.id===item.id ? {...i, image:null}:i))} className="text-xs text-rose-500 font-bold hover:underline">Rimuovi foto</button>}
                          {item.image && enhanceImage && <button onClick={() => enhanceImage(item.id)} disabled={enhancingItemId===item.id} className="text-xs text-violet-600 font-bold bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 hover:bg-violet-100 disabled:opacity-50">{enhancingItemId===item.id ? '...' : '✨ Migliora'}</button>}
                        </div>
                        {/* Copy IA */}
                        {generateCopy && <button onClick={() => generateCopy(item.id)} disabled={generatingCopyId===item.id} className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-200 hover:bg-violet-100 disabled:opacity-50 flex items-center gap-1.5">{generatingCopyId===item.id ? 'Generando...' : (item.description ? '✨ Migliora copy IA' : '✨ Genera copy IA')}</button>}
                        {/* Ingredienti */}
                        <div>
                          <label className="text-xs font-bold text-slate-500 block mb-1">INGREDIENTI</label>
                          <input type="text" value={item.ingredients||''} onChange={e => setItems(items.map(i => i.id===item.id ? {...i, ingredients:e.target.value}:i))} placeholder="Es. farina, mozzarella..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Footer: Nuovo piatto + Nuova categoria */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap gap-2 bg-[#FAF8F5]">
          <button onClick={() => setShowNewDishModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-[#C4622D] hover:text-[#C4622D] transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v6m0 0v6m0-6h6m-6 0H6" transform="translate(0,3)"/><path d="M3 3h4l2-2h6l2 2h4"/></svg>
            Nuovo piatto
          </button>
          {showNewCatInput ? (
            <div className="flex items-center gap-2">
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nome categoria" autoFocus onKeyDown={e => e.key==='Enter' && handleAddCategory()} className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 w-40" />
              <button onClick={handleAddCategory} className="px-3 py-2 bg-teal-500 text-white text-sm font-bold rounded-xl hover:bg-teal-600">OK</button>
              <button onClick={() => { setShowNewCatInput(false); setNewCatName(''); }} className="px-3 py-2 text-sm text-slate-400 hover:text-slate-600">✕</button>
            </div>
          ) : (
            <button onClick={() => setShowNewCatInput(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nuova categoria
            </button>
          )}
        </div>
      </div>

      {/* Modale nuovo piatto */}
      <NewDishModal isOpen={showNewDishModal} onClose={() => setShowNewDishModal(false)} onAdd={handleAddDish} categories={categories} settings={settings} />

      {/* Modale conferma eliminazione */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Conferma eliminazione</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {deleteConfirm.type === 'category'
                ? <>Vuoi eliminare la categoria <strong>&quot;{deleteConfirm.name}&quot;</strong> e tutti i piatti al suo interno? Questa azione è irreversibile.</>
                : <>Vuoi eliminare il piatto <strong>&quot;{deleteConfirm.name}&quot;</strong>? Questa azione è irreversibile.</>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Annulla</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 px-4 bg-rose-500 text-white font-bold rounded-xl text-sm hover:bg-rose-600 transition-colors">Elimina</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
