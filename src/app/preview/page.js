"use client";
import { useEffect, useState } from 'react';
import MenuRenderer from '@/components/MenuRenderer';

export default function PreviewPage() {
  const [data, setData] = useState({ menu: [], settings: null });

  useEffect(() => {
    const handler = (event) => {
      if (event.data && event.data.type === 'UPDATE_PREVIEW') {
        setData({
          menu: event.data.menu || [],
          settings: event.data.settings || null
        });
      }
    };
    
    // Inizia la comunicazione con il genitore
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
    
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!data.settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">Calibrazione Schermo...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen w-full overflow-x-hidden">
      <MenuRenderer menu={data.menu} settings={data.settings} restaurantId="preview" />
    </div>
  );
}
