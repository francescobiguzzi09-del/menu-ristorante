"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('active'); // active, suspended, banned, appeals, scans
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const router = useRouter();

  // Modal State for Suspension
  const [suspendModal, setSuspendModal] = useState({ isOpen: false, userId: null, days: 1 });

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchAppeals = async () => {
    const { data } = await supabase.from('appeals').select('*').order('created_at', { ascending: false });
    if (data) setAppeals(data);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'francesco.biguzzi09@gmail.com') {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      await Promise.all([fetchUsers(), fetchAppeals()]);
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const handleUpdateStatus = async (userId, newStatus, suspendedUntil = null) => {
    try {
      await supabase.from('profiles').update({ status: newStatus, suspended_until: suspendedUntil }).eq('id', userId);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus, suspended_until: suspendedUntil } : u));
      if (suspendModal.isOpen) setSuspendModal({ isOpen: false, userId: null, days: 1 });
    } catch (err) {
      alert("Errore durante l'aggiornamento dello status");
    }
  };

  const handleTogglePremium = async (userId, currentPremium) => {
    try {
      await supabase.from('profiles').update({ is_premium: !currentPremium }).eq('id', userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_premium: !currentPremium } : u));
    } catch (err) {
      alert("Errore durante l'aggiornamento del Premium");
    }
  };

  const handleDeleteAppeal = async (id) => {
    await supabase.from('appeals').delete().eq('id', id);
    setAppeals(appeals.filter(a => a.id !== id));
  };

  const handleAIScan = async () => {
    if(!confirm("Avviare la scansione IA su tutti i menù del database? Potrebbe richiedere tempo.")) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/admin/scan-menus', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScanResults(data.report || []);
        if (data.report && data.report.length > 0) {
          setTab('scans');
        } else {
          alert("Scansione completata. Nessuna violazione rilevata!");
        }
      } else {
        alert("Errore: " + data.error);
      }
    } catch (err) {
      alert("Errore di rete durante la scansione");
    } finally {
      setIsScanning(false);
    }
  };

  if (loading || !isAdmin) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">Autenticazione Admin in corso...</div>;

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search));
  
  const displayedUsers = filteredUsers.filter(u => {
    if (tab === 'active') return u.status === 'active';
    if (tab === 'suspended') return u.status === 'suspended';
    if (tab === 'banned') return u.status === 'banned';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 rounded flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">SuperAdmin</h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Torna alla Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Gestione Utenti</h2>
            <p className="text-slate-500 text-sm">Pannello di controllo riservato all'amministratore.</p>
          </div>
          
          <button 
            onClick={handleAIScan}
            disabled={isScanning}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            {isScanning ? 'Scansione IA in corso...' : 'Scansione IA Menù Sospetti'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Utenti Totali</p>
            <p className="text-3xl font-black text-slate-800">{users.length}</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Acct Attivi</p>
            <p className="text-3xl font-black text-emerald-900">{users.filter(u => u.status==='active').length}</p>
          </div>
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Bannati/Sospesi</p>
            <p className="text-3xl font-black text-rose-900">{users.filter(u => u.status!=='active').length}</p>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Reclami Aperti</p>
            <p className="text-3xl font-black text-amber-900">{appeals.length}</p>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto hide-scrollbar">
            {['active', 'suspended', 'banned', 'appeals', 'scans'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'active' ? 'Attivi' : t === 'suspended' ? 'Sospesi' : t === 'banned' ? 'Bannati' : t === 'appeals' ? 'Reclami' : 'Scansioni IA'}
                {t === 'appeals' && appeals.length > 0 && <span className="ml-2 bg-rose-500 text-white px-1.5 py-0.5 rounded text-[10px]">{appeals.length}</span>}
                {t === 'scans' && scanResults.length > 0 && <span className="ml-2 bg-rose-500 text-white px-1.5 py-0.5 rounded text-[10px]">{scanResults.length}</span>}
              </button>
            ))}
          </div>
          
          {(tab !== 'appeals' && tab !== 'scans') && (
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cerca per email o ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          )}
        </div>

        {/* Content Area */}
        {tab === 'scans' ? (
           <div className="space-y-4">
             {scanResults.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200"><p className="text-slate-500">Nessuna scansione recente o nessuna violazione trovata.</p></div>
             ) : (
                <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4">Status Ristorante</th>
                          <th className="px-6 py-4">Violazione & Gravità</th>
                          <th className="px-6 py-4">Testo Rilevato (Snippet)</th>
                          <th className="px-6 py-4 text-right">Azioni su Utente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scanResults.sort((a, b) => a.severity === 'alta' ? -1 : 1).map((s, idx) => {
                          const violator = users.find(u => u.id === s.user_id) || {};
                          return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="font-bold text-slate-900">{s.id}</div>
                               <div className="font-mono text-[10px] text-slate-400 mt-1 truncate w-40" title={s.user_id}>User ID: {s.user_id}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col items-start gap-1">
                                 <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${s.severity === 'alta' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                   {s.severity === 'alta' ? 'Alta Gravità' : 'Media Gravità'}
                                 </span>
                                 <p className="text-sm text-slate-700 mt-1 max-w-xs">{s.reason}</p>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-rose-600 font-mono italic max-w-sm">"{s.snippet}"</div>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                               {violator.id && violator.status === 'active' ? (
                                  <>
                                    <button onClick={() => setSuspendModal({ isOpen: true, userId: violator.id, days: 3 })} className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors">Sospendi</button>
                                    <button onClick={() => handleUpdateStatus(violator.id, 'banned')} className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors">Banna</button>
                                  </>
                               ) : violator.id ? (
                                  <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{violator.status}</span>
                               ) : <span className="text-xs text-slate-400">User not found</span>}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
             )}
           </div>
        ) : tab === 'appeals' ? (
          <div className="space-y-4">
            {appeals.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-2xl border border-slate-200"><p className="text-slate-500">Nessun reclamo al momento.</p></div>
            ) : (
              appeals.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">{new Date(a.created_at).toLocaleString()}</p>
                      <h4 className="text-lg font-bold text-slate-900">{a.user_email}</h4>
                      <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded uppercase tracking-wider">{a.status}</span>
                    </div>
                    <button onClick={() => handleDeleteAppeal(a.id)} className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors">Segna come Risolto / Elimina</button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                    {a.message}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Utente</th>
                    <th className="px-6 py-4">Status & Premium</th>
                    <th className="px-6 py-4">Data Iscrizione</th>
                    <th className="px-6 py-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedUsers.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-400 font-medium">Nessun utente trovato.</td></tr>
                  )}
                  {displayedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.email}</div>
                        <div className="font-mono text-[10px] text-slate-400">{u.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : u.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {u.status} {u.status === 'suspended' && `- Fino al ${new Date(u.suspended_until).toLocaleDateString()}`}
                          </span>
                          {u.is_premium && <span className="px-2 py-1 text-[10px] font-black rounded uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-500 text-white">Premium</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <button onClick={() => handleTogglePremium(u.id, u.is_premium)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${u.is_premium ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                           {u.is_premium ? 'Rimuovi Premium' : 'Dai Premium'}
                         </button>
                         
                         {u.status !== 'active' ? (
                           <button onClick={() => handleUpdateStatus(u.id, 'active')} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors">
                             Riammetti
                           </button>
                         ) : (
                           <>
                             <button onClick={() => setSuspendModal({ isOpen: true, userId: u.id, days: 3 })} className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors">
                               Sospendi
                             </button>
                             <button onClick={() => handleUpdateStatus(u.id, 'banned')} className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors">
                               Banna
                             </button>
                           </>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Suspend Modal */}
      {suspendModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 relative">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sospendi Account</h3>
              <p className="text-sm text-slate-500 mb-6">Inserisci i giorni di sospensione. L'utente non potrà accedere alla dashboard in questo periodo.</p>
              
              <label className="block text-sm font-bold text-slate-700 mb-2">Giorni di Sospensione</label>
              <input 
                type="number" 
                min="1"
                value={suspendModal.days}
                onChange={(e) => setSuspendModal({...suspendModal, days: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-6"
              />
              
              <div className="flex gap-3">
                <button onClick={() => setSuspendModal({ isOpen: false, userId: null, days: 1 })} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">Annulla</button>
                <button 
                  onClick={() => {
                     const date = new Date();
                     date.setDate(date.getDate() + suspendModal.days);
                     handleUpdateStatus(suspendModal.userId, 'suspended', date.toISOString());
                  }} 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
                >
                  Conferma
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
