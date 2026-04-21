"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import ReviewsPanel from '@/components/ReviewsPanel';
import OrdersPanel from '@/components/OrdersPanel';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';

// Brand palette
const B = {
  espresso: '#2D2016',
  terracotta: '#C4622D',
  ambra: '#E8A84A',
  oliva: '#4A7C59',
  crema: '#FAF8F5',
  carbone: '#2C2C2A',
};

export default function DashboardPage() {
  const [menus, setMenus] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menus');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const router = useRouter();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      const { data: profile } = await supabase.from('profiles').select('status, suspended_until').eq('id', session.user.id).single();
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
            await supabase.from('profiles').update({ status: 'active', suspended_until: null }).eq('id', session.user.id);
          }
        }
      }

      const { data, error } = await supabase
        .from('menus')
        .select('restaurant_id, data')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
         setMenus(data);
      } else {
         const { data: fallbackData } = await supabase.from('menus').select('restaurant_id, data').eq('user_id', session.user.id);
         if (fallbackData) setMenus(fallbackData);
      }
      
      setIsLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createNewMenu = () => {
    router.push(`/onboarding`);
  };

  const deleteMenu = (e, id) => {
    e.stopPropagation();
    setMenuToDelete(id);
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    try {
      const res = await fetch(`/api/menu?restaurantId=${menuToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMenus(menus.filter(m => m.restaurant_id !== menuToDelete));
        setMenuToDelete(null);
        toast.success('Menù eliminato con successo.', 'Eliminato');
      } else {
        toast.error('Errore del server: ' + data.error, 'Errore');
        setMenuToDelete(null);
      }
    } catch (err) {
      toast.error('Errore di connessione al server.', 'Errore');
      setMenuToDelete(null);
    }
  };

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5', color: 'rgba(45,32,22,0.4)', fontFamily: "var(--font-inter)" }}>Caricamento Dashboard...</div>;

  // Sidebar nav items
  const navItems = [
    { key: 'menus', label: 'I Miei Menù', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
    )},
    { key: 'analytics', label: 'Analytics', badge: 'Beta', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    )},
    { key: 'reviews', label: 'Recensioni', badge: 'Beta', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    )},
    { key: 'orders', label: 'Ordini', badge: 'Beta', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
    )},
  ];

  const generalItems = [
    { href: '/dashboard/settings', label: 'Impostazioni', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    )},
    { href: '/faq', label: 'Aiuto', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
    )},
  ];

  const totalDishes = menus.reduce((acc, menu) => acc + (menu.data?.menu?.length || 0), 0);
  const totalCategories = menus.reduce((acc, menu) => {
    const cats = new Set((menu.data?.menu || []).map(d => d.category).filter(Boolean));
    return acc + cats.size;
  }, 0);

  // Filter menus by search
  const filteredMenus = menus.filter(m => {
    if (!searchQuery.trim()) return true;
    const name = (m.data?.settings?.restaurantName || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', color: B.carbone, fontFamily: "var(--font-inter), 'Inter', sans-serif", display: 'flex', transition: 'background .3s' }}>

      {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
      <aside style={{
        width: 260, flexShrink: 0, background: '#fff',
        borderRight: '1px solid rgba(45,32,22,0.08)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transition: 'all .3s',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(45,32,22,0.06)' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/sm-logo.png" alt="SmartMenu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(2.5)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: B.espresso, letterSpacing: -0.3 }}>SmartMenu</span>
          </a>
        </div>

        {/* MENU section */}
        <div style={{ padding: '20px 16px 8px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(45,32,22,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Menu</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    background: isActive ? 'rgba(196,98,45,0.08)' : 'transparent',
                    color: isActive ? B.terracotta : 'rgba(45,32,22,0.55)',
                    transition: 'all .2s', width: '100%', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(45,32,22,0.03)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: isActive ? B.terracotta : 'rgba(45,32,22,0.35)' }}>{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span style={{ fontSize: 9, background: B.oliva, color: '#fff', fontWeight: 600, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: 'auto' }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* GENERAL section */}
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(45,32,22,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginTop: 24, marginBottom: 8 }}>Generale</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {generalItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 12, fontSize: 13, fontWeight: 500,
                  color: 'rgba(45,32,22,0.55)', textDecoration: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(45,32,22,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(45,32,22,0.35)' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: 'transparent', color: '#dc2626', width: '100%', textAlign: 'left',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              </span>
              Esci
            </button>
          </div>
        </div>

        {/* Beta feedback card in sidebar */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{
            background: `linear-gradient(135deg, ${B.terracotta}, ${B.espresso})`,
            borderRadius: 16, padding: 18, color: B.crema, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: '#fff', opacity: 0.06 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Beta Gratuita</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)', marginBottom: 14, lineHeight: 1.5 }}>
              Tutti i servizi premium sono gratuiti. Inviaci i tuoi feedback!
            </p>
            <a href="mailto:info@smartmenu.ai" style={{
              display: 'block', width: '100%', background: '#FAF8F5', color: B.espresso,
              fontWeight: 600, padding: '8px 12px', borderRadius: 10, textAlign: 'center',
              textDecoration: 'none', fontSize: 12, transition: 'opacity .2s', boxSizing: 'border-box',
            }}>
              Feedback
            </a>
          </div>
        </div>
      </aside>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── TOP BAR ─────────────────────────────────── */}
        <header style={{
          background: '#fff', borderBottom: '1px solid rgba(45,32,22,0.08)',
          position: 'sticky', top: 0, zIndex: 30,
          padding: '0 32px', height: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(45,32,22,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Cerca ristorante..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px 10px 42px', border: '1.5px solid rgba(45,32,22,0.08)',
                borderRadius: 12, background: '#FAF8F5', fontSize: 13, fontWeight: 500,
                outline: 'none', transition: 'all .2s', color: B.espresso,
              }}
              onFocus={e => { e.target.style.borderColor = B.terracotta; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(45,32,22,0.08)'; e.target.style.background = '#FAF8F5'; }}
            />
          </div>

          {/* Right: icons + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Dark mode toggle */}
            <button onClick={toggleTheme} title={theme === 'dark' ? 'Modalità Chiara' : 'Modalità Scura'} style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(45,32,22,0.08)',
              background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(45,32,22,0.4)', transition: 'all .2s',
            }}>
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" x2="12" y1="1" y2="3"/><line x1="12" x2="12" y1="21" y2="23"/><line x1="4.22" x2="5.64" y1="4.22" y2="5.64"/><line x1="18.36" x2="19.78" y1="18.36" y2="19.78"/><line x1="1" x2="3" y1="12" y2="12"/><line x1="21" x2="23" y1="12" y2="12"/><line x1="4.22" x2="5.64" y1="19.78" y2="18.36"/><line x1="18.36" x2="19.78" y1="5.64" y2="4.22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            {/* Notifications */}
            <button style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(45,32,22,0.08)',
              background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(45,32,22,0.4)', position: 'relative',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: B.terracotta, border: '2px solid #fff' }} />
            </button>

            {user?.email === 'francesco.biguzzi09@gmail.com' && (
              <button
                onClick={() => router.push('/superadmin')}
                style={{
                  fontSize: 11, fontWeight: 600, background: 'rgba(220,38,38,0.08)', color: '#dc2626',
                  padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.15)',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin
              </button>
            )}

            {/* User Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 12px',
                  background: '#FAF8F5', border: '1px solid rgba(45,32,22,0.1)', borderRadius: 24,
                  cursor: 'pointer', transition: 'all .2s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.6)' }}>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: B.terracotta, color: B.crema,
                  fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                }}>
                  {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>
              
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, marginTop: 8, width: 260, background: '#fff',
                  borderRadius: 16, boxShadow: '0 12px 40px rgba(45,32,22,0.12)',
                  border: '1px solid rgba(45,32,22,0.06)', padding: 8, zIndex: 50,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(45,32,22,0.06)' }}>
                    <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(45,32,22,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Account</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: B.espresso, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                  </div>
                  
                  <div style={{ padding: 4, borderBottom: '1px solid rgba(45,32,22,0.06)' }}>
                    <a href="/dashboard/stripe" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.7)', textDecoration: 'none', borderRadius: 10, transition: 'background .2s' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      Gestione Pagamenti
                    </a>
                    <a href="/dashboard/billing" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: 'rgba(45,32,22,0.7)', textDecoration: 'none', borderRadius: 10, transition: 'background .2s' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Piani e Abbonamenti
                    </a>
                  </div>
                  
                  <div style={{ padding: 4 }}>
                    <button onClick={handleLogout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#dc2626',
                      background: 'none', border: 'none', borderRadius: 10, cursor: 'pointer',
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      Esci dall&apos;Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ─────────────────────────────── */}
        <main style={{ flex: 1, padding: '28px 32px' }}>
          {/* Page title + CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: B.espresso, marginBottom: 6 }}>
                Dashboard
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)', lineHeight: 1.5 }}>
                Benvenuto, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}. Gestisci i tuoi menù digitali.
              </p>
            </div>
            <button
              onClick={createNewMenu}
              style={{
                background: B.terracotta, color: B.crema, fontWeight: 600, padding: '12px 24px',
                borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s',
                boxShadow: '0 4px 12px rgba(196,98,45,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(196,98,45,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(196,98,45,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Crea Nuovo Menù
            </button>
          </div>

          {/* ── STAT CARDS (4 columns) ─────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {/* Total Menus */}
            <div style={{
              background: B.terracotta, borderRadius: 16, padding: '20px 20px',
              position: 'relative', overflow: 'hidden', color: B.crema,
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: '#fff', opacity: 0.08 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 500, opacity: 0.8 }}>Menù Totali</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, lineHeight: 1 }}>{menus.length}</p>
            </div>

            {/* Total Dishes */}
            <div style={{
              background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 16, padding: '20px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(45,32,22,0.5)' }}>Piatti Pubblicati</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(74,124,89,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.oliva} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: B.espresso, lineHeight: 1 }}>{totalDishes}</p>
            </div>

            {/* Categories */}
            <div style={{
              background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 16, padding: '20px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(45,32,22,0.5)' }}>Categorie</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,168,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.ambra} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-display), serif', fontSize: 36, fontWeight: 500, color: B.espresso, lineHeight: 1 }}>{totalCategories}</p>
            </div>

            {/* Quick Links */}
            <div style={{
              background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 16, padding: '20px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(45,32,22,0.5)' }}>Link Rapidi</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(196,98,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.terracotta} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a href="/api-docs" style={{ fontSize: 12, fontWeight: 500, color: B.terracotta, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  API Docs
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                <a href="/dashboard/stripe" style={{ fontSize: 12, fontWeight: 500, color: B.terracotta, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Stripe
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* ── TAB CONTENT ────────────────────────────── */}
          {activeTab === 'analytics' ? (
            <AnalyticsPanel menus={menus} />
          ) : activeTab === 'reviews' ? (
            <ReviewsPanel menus={menus} />
          ) : activeTab === 'orders' ? (
            <OrdersPanel menus={menus} />
          ) : (
            <>
              {/* LISTA MENU */}
              {filteredMenus.length === 0 && menus.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 24, padding: '60px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(196,98,45,0.06)', border: '1px solid rgba(196,98,45,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(3deg)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={B.terracotta} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 22, fontWeight: 500, color: B.espresso, marginBottom: 8 }}>Ancora nessun menù</h3>
                  <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.5)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>Mostra i tuoi piatti al mondo. Clicca per creare la tua prima vetrina digitale con intelligenza artificiale.</p>
                  <button onClick={createNewMenu} style={{
                    background: B.espresso, color: B.crema, fontWeight: 600, padding: '14px 28px',
                    borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 14, transition: 'all .2s',
                  }}>
                    Crea il tuo Primo Menù
                  </button>
                </div>
              ) : filteredMenus.length === 0 && searchQuery ? (
                <div style={{ background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.4)' }}>Nessun risultato per &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {filteredMenus.map((menu) => (
                    <div key={menu.restaurant_id} onClick={() => router.push(`/admin?id=${menu.restaurant_id}`)} style={{
                      background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 20,
                      overflow: 'hidden', cursor: 'pointer', transition: 'all .3s', display: 'flex', flexDirection: 'column',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(196,98,45,0.08)'; e.currentTarget.style.borderColor = 'rgba(196,98,45,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(45,32,22,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Cover */}
                      <div style={{ height: 100, background: `linear-gradient(135deg, ${B.crema}, rgba(196,98,45,0.06))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(45,32,22,0.04)' }}>
                        {menu.data?.settings?.restaurantName ? (
                          <div style={{ width: 52, height: 52, background: '#fff', borderRadius: 14, border: '1px solid rgba(45,32,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: B.espresso }}>
                            {menu.data.settings.restaurantName.substring(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          <div style={{ width: 52, height: 52, background: '#fff', borderRadius: 14, border: '1px solid rgba(45,32,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(45,32,22,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                          </div>
                        )}
                        {/* Delete button */}
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <button
                            onClick={(e) => deleteMenu(e, menu.restaurant_id)}
                            title="Elimina"
                            style={{
                              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                              color: 'rgba(45,32,22,0.4)', padding: 6, borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer',
                              transition: 'all .2s', position: 'relative', zIndex: 20,
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, fontSize: 17, color: B.espresso, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{menu.data?.settings?.restaurantName || 'Menù Senza Nome'}</h3>
                        <div
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16, fontSize: 11, color: 'rgba(45,32,22,0.3)', fontFamily: 'monospace', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(menu.restaurant_id);
                            toast.success('ID Ristorante copiato negli appunti!', 'Copiato');
                          }}
                          title="Copia ID"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{menu.restaurant_id}</span>
                        </div>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(45,32,22,0.04)', paddingTop: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(45,32,22,0.5)', textTransform: 'uppercase', background: '#FAF8F5', padding: '4px 10px', borderRadius: 8 }}>{menu.data?.menu?.length || 0} Piatti</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: B.terracotta, display: 'flex', alignItems: 'center', gap: 4 }}>
                            Modifica
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <Footer />
      </div>

      {/* DELETE MODAL */}
      {menuToDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(45,32,22,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(45,32,22,0.06)', borderRadius: 24, padding: 32, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(45,32,22,0.15)' }}>
            <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 500, color: B.espresso, marginBottom: 8 }}>Elimina Menù</h3>
            <p style={{ fontSize: 14, color: 'rgba(45,32,22,0.55)', marginBottom: 24, lineHeight: 1.5 }}>Sei sicuro di voler eliminare definitivamente questo menù? L&apos;azione è irreversibile.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setMenuToDelete(null)} style={{ flex: 1, background: '#FAF8F5', border: 'none', color: B.espresso, fontWeight: 600, padding: 12, borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>Annulla</button>
              <button onClick={confirmDeleteMenu} style={{ flex: 1, background: '#dc2626', border: 'none', color: '#fff', fontWeight: 600, padding: 12, borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
