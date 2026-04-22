"use client";
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPanel({ menus }) {
   const [selectedRestId, setSelectedRestId] = useState(menus.length > 0 ? menus[0].restaurant_id : '');
   const [analyticsData, setAnalyticsData] = useState(null);
   const [loadingAnalytics, setLoadingAnalytics] = useState(false);

   useEffect(() => {
      if (!selectedRestId) return;
      const fetchAnalytics = async () => {
         setLoadingAnalytics(true);
         try {
            const { data, error } = await supabase
               .from('analytics')
               .select('*')
               .eq('restaurant_id', selectedRestId)
               .single();

            if (data && !error) {
               setAnalyticsData(data);
            } else {
               setAnalyticsData(null);
            }
         } catch (err) {
            console.error(err);
            setAnalyticsData(null);
         } finally {
            setLoadingAnalytics(false);
         }
      };
      fetchAnalytics();
   }, [selectedRestId]);

   const targetMenuData = useMemo(() => {
      return menus.find(m => m.restaurant_id === selectedRestId)?.data || null;
   }, [selectedRestId, menus]);

   const analytics = analyticsData || {
      views: 0,
      time_spent_total: 0,
      time_spent_count: 0,
      item_clicks: {}
   };

   const visits = analytics.views || 0;

   const avgTimeSeconds = analytics.time_spent_count > 0
      ? Math.round((analytics.time_spent_total || 0) / analytics.time_spent_count)
      : 0;
   const avgMins = Math.floor(avgTimeSeconds / 60).toString().padStart(2, '0');
   const avgSecs = (avgTimeSeconds % 60).toString().padStart(2, '0');
   const formattedAvgTime = `${avgMins}:${avgSecs}`;

   const topItems = useMemo(() => {
      if (!targetMenuData || !targetMenuData.menu) return [];

      let itemClicksObj = analytics.item_clicks;
      if (typeof itemClicksObj !== 'object' || itemClicksObj === null) itemClicksObj = {};

      const items = [...targetMenuData.menu].map(item => {
         const clicks = itemClicksObj[item.id] || 0;
         return { ...item, clicks };
      }).sort((a, b) => b.clicks - a.clicks);

      const maxClicks = Math.max(1, items[0]?.clicks || 1);

      return items.slice(0, 5).map(item => ({
         ...item,
         score: item.clicks > 0 ? Math.round((item.clicks / maxClicks) * 100) : 0,
         clicks: item.clicks
      }));
   }, [targetMenuData, analytics.item_clicks]);

   // Build chart from real daily_views data
   // Shows last 7 days: from 7 days ago up to yesterday (today's data will show tomorrow)
   const DAY_LABELS_IT = ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'];

   const chartInfo = useMemo(() => {
      const dailyViews = (analytics.daily_views && typeof analytics.daily_views === 'object')
         ? analytics.daily_views
         : {};

      const now = new Date();
      const days = [];

      // Go back 7 days: day -7 to day -1 (yesterday)
      for (let i = 7; i >= 1; i--) {
         const d = new Date(now);
         d.setDate(d.getDate() - i);
         // Format as YYYY-MM-DD in local timezone
         const year = d.getFullYear();
         const month = String(d.getMonth() + 1).padStart(2, '0');
         const day = String(d.getDate()).padStart(2, '0');
         const dateKey = `${year}-${month}-${day}`;
         const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon...

         days.push({
            dateKey,
            label: DAY_LABELS_IT[dayOfWeek],
            value: dailyViews[dateKey] || 0
         });
      }

      return days;
   }, [analytics.daily_views]);

   const chartData = chartInfo.map(d => d.value);
   const chartLabels = chartInfo.map(d => d.label);

   if (menus.length === 0) {
      return (
         <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm animate-in fade-in">
            Non hai ancora creato alcun menu. Crea il tuo primo menu per sbloccare le Statistiche Avanzate.
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">

         {/* SELETTORE RISTORANTE E HEADER */}
         <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Analytics Avanzate</h2>
                  <p className="text-sm text-slate-500 font-medium">Scopri le performance dei tuoi menù.</p>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
               </div>
            </div>
         </div>

         {/* KPI CARDS GLOBALI */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Scansioni QR / Aperture
               </p>
               <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{visits}</h3>
               {visits === 0 && <p className="text-slate-400 text-xs mt-2">Nessun dato registrato</p>}
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span> Tempo Medio (Min:Sec)
               </p>
               <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{formattedAvgTime}</h3>
               {formattedAvgTime === '00:00' && <p className="text-slate-400 text-xs mt-2">Nessun dato registrato</p>}
            </div>

            <div className="bg-slate-900 rounded-[24px] border border-slate-800 p-6 shadow-xl relative overflow-hidden group text-white">
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/20 blur-2xl rounded-full"></div>
               <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  Piatto o Categoria Top
               </p>
               <h3 className="text-2xl font-black text-white leading-tight truncate">
                  {topItems.length > 0 && topItems[0].clicks > 0 ? topItems[0].name : 'N/A'}
               </h3>
               <p className="text-slate-400 text-xs mt-2 truncate">Il piatto cliccato di piu dai tuoi clienti.</p>
            </div>
         </div>

         {/* CLASSIFICA E GRAFICI */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* PIATTI PIU VISTI */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
               <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Piatti Piu Cliccati
               </h3>
               <div className="space-y-5">
                  {topItems.map((item, index) => (
                     <div key={item.id}>
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                 {index + 1}
                              </span>
                              <span className="text-sm font-bold text-slate-800 truncate max-w-[150px] sm:max-w-xs">{item.name}</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400">{item.score}% popolarità</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                           <div
                              className={`h-2.5 rounded-full ${index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-slate-300'}`}
                              style={{ width: `${item.score}%` }}
                           ></div>
                        </div>
                     </div>
                  ))}
                  {topItems.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nessun dato registrato</p>}
               </div>
            </div>

            {/* VISUALIZZAZIONI ANDAMENTO */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col w-full min-h-[360px]">
               <h3 className="text-base font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                  Visite (Ultimi 7 Giorni)
               </h3>

               {(() => {
                  const rawMaxRecord = Math.max(...chartData, 0);
                  let yAxisMax = 4;
                  if (rawMaxRecord > 0) {
                     if (rawMaxRecord > 100) yAxisMax = Math.ceil(rawMaxRecord / 40) * 40;
                     else if (rawMaxRecord > 20) yAxisMax = Math.ceil(rawMaxRecord / 20) * 20;
                     else if (rawMaxRecord > 10) yAxisMax = Math.ceil(rawMaxRecord / 8) * 8;
                     else yAxisMax = Math.ceil(rawMaxRecord / 4) * 4;
                  }

                  const yTicks = [yAxisMax, yAxisMax * 0.75, yAxisMax * 0.5, yAxisMax * 0.25, 0];

                  return (
                     <div className="w-full relative mt-6 mb-8 h-56 sm:h-64 block">
                        {/* Asse Y (Ordinate) */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between items-end text-[9px] font-bold text-slate-400 z-10">
                           {yTicks.map((tick, i) => (
                              <span key={i} className="leading-none pr-3 transform -translate-y-1/2">{tick}</span>
                           ))}
                        </div>

                        {/* Spazio del grafico effettivo */}
                        <div className="absolute left-8 right-0 top-0 bottom-0 flex justify-evenly sm:justify-around border-l border-b border-slate-100">

                           {/* Griglia In background */}
                           <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                              {yTicks.map((_, i) => (
                                 <div key={i} className={`w-full border-b ${i === yTicks.length - 1 ? 'border-transparent' : 'border-slate-100 border-dashed'}`}></div>
                              ))}
                           </div>

                           {/* Barre del grafico */}
                           {chartData.map((val, i) => {
                              const heightPct = yAxisMax === 0 ? 0 : Math.max(1, (val / yAxisMax) * 100);
                              return (
                                 <div key={i} className="w-full flex-1 relative group cursor-pointer z-10">
                                    {/* La Barra Visiva */}
                                    <div
                                       className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[24px] sm:max-w-[40px] bg-indigo-100 rounded-t-md sm:rounded-t-lg overflow-hidden group-hover:bg-indigo-300 transition-colors duration-300 shadow-sm"
                                       style={{ height: `${heightPct}%` }}
                                    >
                                       <div className="absolute top-0 w-full h-[3px] bg-indigo-500 rounded-t-md sm:rounded-t-lg"></div>
                                       <div className="absolute bottom-0 w-full h-full bg-indigo-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                    </div>

                                    {/* Asse X Labels */}
                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase absolute -bottom-7 left-1/2 -translate-x-1/2">
                                       {chartLabels[i]}
                                    </span>

                                    {/* Valore On Hover */}
                                    <span className="text-[10px] sm:text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg shadow-sm border border-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap">
                                       {val} visite
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )
               })()}
            </div>

         </div>

      </div>
   );
}
