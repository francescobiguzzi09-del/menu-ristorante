"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReviewsPanel({ menus }) {
  const [selectedRestId, setSelectedRestId] = useState(menus.length > 0 ? menus[0].restaurant_id : '');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRestId) return;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reviews?restaurantId=${selectedRestId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error(err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [selectedRestId]);

  const avgStars = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const starDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { dist[r.stars] = (dist[r.stars] || 0) + 1; });
    return dist;
  }, [reviews]);

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <svg key={s} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={s <= count ? '#f59e0b' : '#e2e8f0'} stroke={s <= count ? '#f59e0b' : '#cbd5e1'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm animate-in fade-in">
        Non hai ancora creato alcun menu. Crea il tuo primo menu per visualizzare le recensioni.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      
      {/* HEADER + SELETTORE RISTORANTE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recensioni</h2>
            <p className="text-sm text-slate-500 font-medium">Scopri cosa pensano i tuoi clienti.</p>
          </div>
        </div>
        
        <div className="w-full md:w-64 relative">
          <select 
            value={selectedRestId} 
            onChange={e => setSelectedRestId(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
          Caricamento recensioni...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30 text-amber-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <h3 className="text-lg font-bold text-slate-700 mb-1">Nessuna recensione</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">I clienti potranno lasciare recensioni direttamente dal menu digitale. Assicurati di aver configurato il link TripAdvisor nelle impostazioni del menu.</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Media Stelle */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Media Voto
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{avgStars}</h3>
                <div className="mb-1.5">{renderStars(Math.round(avgStars))}</div>
              </div>
            </div>

            {/* Totale Recensioni */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Totale Recensioni
              </p>
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{reviews.length}</h3>
            </div>

            {/* Distribuzione */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Distribuzione</p>
              <div className="space-y-1.5">
                {[5,4,3,2,1].map(star => {
                  const count = starDistribution[star] || 0;
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-4 text-right">{star}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LISTA RECENSIONI */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ultime Recensioni
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-xs font-black text-amber-700 uppercase shrink-0">
                        {(review.customer_name || 'A').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{review.customer_name || 'Anonimo'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    {renderStars(review.stars)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 leading-relaxed ml-12 mt-1">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
