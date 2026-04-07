"use client";
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function OrdersPanel({ menus }) {
  const [selectedRestId, setSelectedRestId] = useState(menus.length > 0 ? menus[0].restaurant_id : '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!selectedRestId) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?restaurantId=${selectedRestId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    
    // Polling ogni 15 secondi per nuovi ordini
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [selectedRestId]);

  const handleCompleteOrder = async (orderId) => {
    if (!confirm('Sei sicuro di voler contrassegnare questo ordine come "Consegnato"? Verrà rimosso dalla lista.')) return;
    
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        toast.error('Errore: ' + data.error, 'Errore');
      }
    } catch (err) {
      toast.error('Errore di connessione', 'Errore');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
        Nessun menu esistente.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      
      {/* HEADER + SELETTORE RISTORANTE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Gestione Ordini</h2>
            <p className="text-sm text-slate-500 font-medium">Ricevi e gestisci gli ordini in tempo reale.</p>
          </div>
        </div>
        
        <div className="w-full md:w-64 relative">
          <select 
            value={selectedRestId} 
            onChange={e => setSelectedRestId(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {menus.map(m => (
              <option key={m.restaurant_id} value={m.restaurant_id}>
                {m.data?.settings?.restaurantName || m.restaurant_id}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
          Caricamento ordini...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">Nessun ordine in coda</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Gli ordini inviati dal menu digitale appariranno qui. Ricorda di abilitare "Ordina dal Menu" nelle impostazioni.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
             const items = Array.isArray(order.items) ? order.items : [];
             return (
              <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow animate-in zoom-in-95 duration-300">
                {/* Intestazione Ordine */}
                <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-start relative">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg mb-2">
                       {order.order_number}
                    </span>
                    <h3 className="text-xl font-black text-slate-900">${parseFloat(order.total).toFixed(2)}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1 justify-end">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {formatDate(order.created_at)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{order.payment_method}</p>
                  </div>
                </div>
  
                {/* Contenuto Ordine */}
                <div className="p-5 flex-1 bg-white">
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.quantity}x
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                          <p className="text-xs text-slate-500 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Azioni */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                  <button 
                    onClick={() => handleCompleteOrder(order.id)}
                    className="w-full bg-[#34e0a1] hover:bg-[#2bc88e] text-white font-black py-3 rounded-xl transition-all shadow-md shadow-[#34e0a1]/20 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Fatto / Consegnato
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
