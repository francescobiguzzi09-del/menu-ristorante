**SmartMenu**

Piano di Implementazione - Mobile Responsiveness

Documento tecnico per il team di sviluppo | Aprile 2026

# **1\. Executive Summary**

Il progetto SmartMenu è una SaaS Next.js (App Router) che permette ai ristoratori italiani di creare menù digitali con QR code, traduzione automatica e ordini al tavolo via Stripe. Il design è curato e coerente con un sistema di brand ben definito (palette Espresso/Terracotta/Ambra/Oliva/Crema). Tuttavia, diverse aree critiche non sono ottimizzate per dispositivi mobili - che rappresentano il canale principale del prodotto, dato che i clienti del ristorante scansionano i QR dal telefono.

Questo documento descrive tutti i problemi identificati, le soluzioni raccomandate e un piano di implementazione fase per fase da eseguire in Project IDX (Google).

# **2\. Analisi del Design Attuale**

## **2.1 Punti di forza**

- Sistema di brand solido con palette di colori definita in CSS custom properties (--sm-espresso, --sm-terracotta, ecc.) e token Tailwind corrispondenti.
- Tipografia curata: uso di un font display serif (Fraunces) per i titoli e Inter per il body, con sizing responsive tramite clamp().
- Componenti template del menù (Elegant, Modern, Rustic, Luxury, ecc.) ben strutturati con logica separata.
- Il pannello Admin (admin/page.js) ha una sidebar parzialmente responsive: usa classi Tailwind sm: per collassare le label testuali su schermi piccoli.
- MenuRenderer ha gestione modale item-detail e cart con alcune classi responsive (sm:, md:).
- Il file globals.css imposta font-smoothing e transizioni corrette.

## **2.2 Criticità di design generali**

- Misto di approcci stilistici: alcuni componenti usano inline styles con oggetti JS (stile React puro), altri usano classi Tailwind. Questo rende la manutenzione difficile e crea incoerenza.
- Nessun sistema di media query centralizzato: le rotture responsive non seguono un breakpoint system consistente.
- Immagini non ottimizzate: gli img tag usano src statico invece del componente Next/Image che gestisce lazy loading, WebP e srcset automatici.
- Nessun file di configurazione Tailwind personalizzato che esponga i brand token al sistema - solo variabili CSS raw.

# **3\. Problemi Mobile Identificati**

La tabella seguente riepiloga ogni problema per componente, con priorità di intervento.

| **Componente**                 | **Problema**                                                                                                                                                                                   | **Priorità** |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Homepage - Nav**             | Nessun menu hamburger: i link nav e i bottoni CTA sono sempre visibili in orizzontale. Su <375px si sovrappongono o fuoriescono.                                                               | **CRITICA**  |
| **Homepage - Hero**            | Bottoni CTA in flex row: su schermi <360px il bottone "Crea il menù gratis" e il link "Guarda esempio" si sovrappongono.                                                                       | **ALTA**     |
| **Homepage - Stats**           | Grid a 3 colonne fissa (gridTemplateColumns: repeat(3,1fr)): su mobile le card si restringono troppo (< 100px ciascuna), testo illeggibile.                                                    | **ALTA**     |
| **Homepage - Prezzi**          | Grid a 2 colonne fissa per i piani Free/Pro: su schermi piccoli le card si sovrappongono e il testo viene troncato.                                                                            | **CRITICA**  |
| **Homepage - Footer**          | Grid a 4 colonne fissa (repeat(4,1fr)): su mobile le colonne diventano sottilissime, il testo trabocca.                                                                                        | **CRITICA**  |
| **Dashboard**                  | Sidebar fissa di 260px con marginLeft:260 hardcoded sul main: su schermi < 768px non c'è spazio per il contenuto, non c'è drawer o hamburger.                                                  | **CRITICA**  |
| **Dashboard - Stats**          | Grid a 4 colonne fissa (repeat(4,1fr)): KPI cards illeggibili su mobile.                                                                                                                       | **ALTA**     |
| **Dashboard - Menu Card**      | Grid auto-fill con minmax(280px,1fr): su schermi 320-360px la card singola supera il viewport.                                                                                                 | **MEDIA**    |
| **Admin - Editor**             | Layout a colonne con preview iframe: il preview mobile è già implementato, ma la sidebar di navigazione su schermi < 640px è solo a icone, senza feedback visivo chiaro per la sezione attiva. | **MEDIA**    |
| **Onboarding**                 | Grid template selection a 4 colonne (repeat(4,1fr)): su mobile i template card sono troppo piccoli per essere selezionabili (area tocco < 44px).                                               | **ALTA**     |
| **MenuRenderer - Toolbar**     | I bottoni filter e lingua sono posizionati con absolute/fixed senza gestione del safe area (notch iPhone, barra Android).                                                                      | **MEDIA**    |
| **MenuRenderer - Cart Drawer** | Già parzialmente mobile-first (slide-in-from-bottom, rounded-t-\[2rem\]), ma manca gestione safe-area-inset-bottom per iPhone con home bar.                                                    | **BASSA**    |
| **Tutti i componenti**         | Nessun tag &lt;meta name="viewport"&gt; nel layout root verificabile: verificare che Next.js lo inietti correttamente.                                                                         | **ALTA**     |
| **img tag raw**                | Uso di &lt;img src="/sm-logo.png"&gt; invece di next/image in nav, footer, dashboard: nessun lazy loading, nessun WebP automatico.                                                             | **MEDIA**    |
| **Touch targets**              | Alcuni link nel nav hanno fontSize:13 senza padding adeguato: area tocco < 44px (Apple HIG minimum).                                                                                           | **ALTA**     |

# **4\. Soluzioni Tecniche Raccomandate**

## **4.1 Viewport Meta Tag**

Verificare che in src/app/layout.js sia presente la configurazione metadata con viewport. In Next.js 14+ App Router si usa il Metadata API:

**File: src/app/layout.js**

export const metadata = { ... }; export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, // previene zoom accidentale su form input iOS }; // oppure nel &lt;head&gt;: &lt;meta name="viewport" content="width=device-width, initial-scale=1" /&gt;

## **4.2 Homepage - Navbar Mobile (Hamburger Menu)**

Aggiungere uno stato isMobileMenuOpen e un bottone hamburger visibile solo su schermi < 768px. La nav desktop rimane invariata. Il menu mobile appare come overlay fullscreen o drawer dall'alto.

- Aggiungere useState per isMobileMenuOpen e isMobile (window.innerWidth < 768).
- Usare useEffect con window resize listener per aggiornare isMobile.
- Sostituire il &lt;nav&gt; fisso con: su desktop flex row di link, su mobile un bottone hamburger (☰) che apre un pannello.
- Il pannello mobile deve coprire tutta la viewport con z-index 100, background espresso, e mostrare i link verticalmente con padding adeguato (min 56px per voce).
- Aggiungere un bottone ✕ per chiudere il pannello.
- Il bottone "Registrati gratis" nel mobile menu deve essere largo il 100% del pannello.

## **4.3 Homepage - Grids Responsive**

Convertire tutti i grid fissi in grid responsive:

- Stats (3 col): cambiare in gridTemplateColumns: repeat(auto-fit, minmax(180px, 1fr)) - su mobile collassa a 1 colonna.
- Prezzi (2 col fissa): aggiungere media query per schermi < 600px → gridTemplateColumns: '1fr'. Le card impilate verticalmente.
- Footer (4 col fissa): cambiare in gridTemplateColumns: 'repeat(2, 1fr)' per mobile (< 640px) e 'repeat(4, 1fr)' per desktop.
- Template grid: già usa auto-fit minmax(150px) - OK, ma verificare che su mobile < 350px non vada sotto 2 colonne.

## **4.4 Homepage - Hero CTA Buttons**

Il div dei CTA usa flexWrap: 'wrap' - già corretto. Verificare che su 320px entrambi i bottoni si impilino verticalmente. Soluzione: aggiungere flexDirection: 'column' su mobile e width: '100%' al bottone principale.

## **4.5 Dashboard - Sidebar Mobile Drawer**

Questo è il fix più importante per i ristoratori che gestiscono il menù dal telefono.

- Aggiungere stato isSidebarOpen (default: false su mobile, true su desktop).
- Aggiungere hook useEffect che imposta isSidebarOpen(window.innerWidth >= 768) al mount e su resize.
- La sidebar su mobile diventa position:fixed, full-height, transform:translateX(-100%) quando chiusa e translateX(0) quando aperta, con transition per animazione.
- Aggiungere overlay scuro (backdrop) dietro la sidebar su mobile.
- Aggiungere bottone hamburger nell'header topbar della dashboard (visibile solo su mobile).
- Il main content NON deve avere marginLeft:260 hardcoded - deve essere marginLeft: isMobile ? 0 : 260.
- Alternativa più robusta: usare CSS class-based toggle invece di inline style per la sidebar.

## **4.6 Dashboard - KPI Grid**

Il grid a 4 colonne dei KPI (repeat(4,1fr)) causa card microscopiche su mobile. Soluzione:

**CSS da applicare**

gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" // Su 320px → 2 colonne × 2 righe // Su 768px → 4 colonne × 1 riga

## **4.7 Onboarding - Template Selection**

La selezione template a 4 colonne (repeat(4,1fr)) produce card troppo piccole per il tocco. Soluzioni:

- Cambiare in repeat(2,1fr) su mobile (< 640px): card più grandi, più selezionabili.
- Assicurarsi che ogni card abbia un'area tocco minima di 44×44px (Apple HIG) - aggiungere minHeight: 80 se necessario.
- I bottoni di scelta del piano (gratis/pro) in step 2 hanno gridTemplateColumns: '1fr 1fr' - adeguato, ma verificare padding minimo.

## **4.8 Touch Targets**

I link navbar (fontSize:13 senza padding verticale) hanno area tocco inferiore ai 44px raccomandati. Fix:

- Aggiungere padding: '12px 8px' a tutti i link anchor della navbar.
- I link footer già hanno il giusto font-size ma mancano di padding verticale esplicito - aggiungere padding: '6px 0'.

## **4.9 Next/Image**

Sostituire tutti gli &lt;img&gt; per asset statici con il componente next/image per ottenere lazy loading, WebP, dimensioni ottimali automatiche:

- src/app/page.js - no immagini statiche al momento
- src/components/Footer.js - logo: sostituire &lt;img&gt; con &lt;Image&gt; da 'next/image' (width=36, height=36).
- src/app/dashboard/page.js - logo nella sidebar: stessa sostituzione.
- src/app/admin/page.js - logo nella sidebar: stessa sostituzione.

## **4.10 Safe Area Insets (iPhone Notch / Home Bar)**

Per il cart drawer e la toolbar flottante in MenuRenderer, aggiungere supporto safe area:

**CSS da aggiungere in globals.css**

.safe-bottom { padding-bottom: env(safe-area-inset-bottom); } .safe-top { padding-top: env(safe-area-inset-top); } // Applicare .safe-bottom al cart drawer e al bottone "back to top"

# **5\. Piano di Implementazione**

## **FASE 1 - Fix Critici (1-2 giorni)**

Questi fix bloccano l'usabilità di base su mobile. Devono essere risolti per primi.

- **Task 1.1:** Verificare viewport meta tag in src/app/layout.js - 15 minuti.
- **Task 1.2:** Homepage Navbar: aggiungere hamburger menu con drawer mobile. File: src/app/page.js. Stimato: 2-3 ore.
- **Task 1.3:** Homepage Footer: cambiare grid da 4 a 2 colonne su mobile. File: src/components/Footer.js. Stimato: 30 minuti.
- **Task 1.4:** Homepage Prezzi: cambiare grid da 2 a 1 colonna su < 600px. File: src/app/page.js (sezione prezzi). Stimato: 30 minuti.
- **Task 1.5:** Dashboard Sidebar: implementare drawer mobile con stato isSidebarOpen + hamburger button. File: src/app/dashboard/page.js. Stimato: 3-4 ore.

## **FASE 2 - Fix Alti (2-3 giorni)**

Problemi che degradano l'esperienza ma non la bloccano completamente.

- **Task 2.1:** Homepage Stats: grid responsive auto-fit. File: src/app/page.js. Stimato: 20 minuti.
- **Task 2.2:** Dashboard KPI Grid: auto-fit minmax(140px). File: src/app/dashboard/page.js. Stimato: 20 minuti.
- **Task 2.3:** Onboarding Template Grid: 2 colonne su mobile. File: src/app/onboarding/page.js. Stimato: 30 minuti.
- **Task 2.4:** Touch targets: aggiungere padding a link nav e footer. File: src/app/page.js, src/components/Footer.js. Stimato: 1 ora.
- **Task 2.5:** Dashboard - Billing, Settings, Stripe pages: revisione per mobile (header, form input, grid). Stimato: 2-3 ore totali.

## **FASE 3 - Fix Medi e Ottimizzazioni (2-3 giorni)**

- **Task 3.1:** Sostituire img con next/image in Footer, Dashboard sidebar, Admin sidebar. Stimato: 1 ora.
- **Task 3.2:** Safe area insets: aggiungere CSS e applicare a cart drawer e toolbar. Stimato: 30 minuti.
- **Task 3.3:** Dashboard menu-card grid: verificare comportamento su 320px, aggiustare minmax se necessario. Stimato: 30 minuti.
- **Task 3.4:** Admin sidebar: migliorare feedback visuale sezione attiva su schermi icon-only. Stimato: 1 ora.
- **Task 3.5:** Login/onboarding forms: verificare padding e dimensioni input su iOS (evitare zoom automatico - font-size minimo 16px). Stimato: 1 ora.

## **FASE 4 - Quality Assurance**

- **Task 4.1:** Test su dispositivi reali: iPhone SE (375px), iPhone 14 (390px), Pixel 7 (393px), dispositivi Android budget (360px).
- **Task 4.2:** Test con Chrome DevTools: tutti i breakpoint da 320px a 430px per la homepage, 768px per il dashboard.
- **Task 4.3:** Test dei flussi critici: registrazione → onboarding → admin editor → dashboard su mobile.
- **Task 4.4:** Test del flusso cliente: scansione QR → visualizzazione menù → aggiunta al carrello → checkout. Già parzialmente mobile-first.

# **6\. File da Modificare - Riferimento Rapido**

Elenco ordinato per priorità di intervento:

| **File**                           | **Modifiche necessarie**                                     |
| ---------------------------------- | ------------------------------------------------------------ |
| src/app/layout.js                  | Aggiungere export const viewport per meta tag                |
| src/app/page.js                    | Hamburger nav, hero CTA stack, stats grid, prezzi grid       |
| src/components/Footer.js           | 4-col → 2-col grid su mobile, next/image per logo            |
| src/app/dashboard/page.js          | Sidebar mobile drawer, KPI grid responsive, hamburger button |
| src/app/onboarding/page.js         | Template grid 4-col → 2-col su mobile, touch targets         |
| src/app/admin/page.js              | Migliorare feedback sidebar icon-only su mobile              |
| src/app/dashboard/billing/page.js  | Revisione layout form su mobile                              |
| src/app/dashboard/settings/page.js | Revisione layout form su mobile                              |
| src/app/globals.css                | Aggiungere utility .safe-bottom, .safe-top                   |

# **7\. Note Tecniche per Project IDX**

## **7.1 Ambiente di sviluppo**

- Il progetto usa Next.js 14+ con App Router. Tutti i file 'use client' possono usare useState e useEffect per gestire la responsività via JavaScript se necessario, ma preferire soluzioni CSS-first.
- Il progetto usa Tailwind CSS v4 (importato via @import "tailwindcss"). I breakpoint predefiniti sono: sm:640px, md:768px, lg:1024px, xl:1280px. Usarli invece di media query inline.
- Per le sezioni che usano inline styles (page.js), la strategia di migrazione raccomandata è: aggiungere un hook useMobile() che restituisce isMobile (boolean) e usarlo per selezionare stili condizionali o classi Tailwind.

## **7.2 Suggerimento: Hook useMobile**

**src/hooks/useMobile.js (nuovo file da creare)**

'use client'; import { useState, useEffect } from 'react'; export function useMobile(breakpoint = 768) { const \[isMobile, setIsMobile\] = useState(false); useEffect(() => { const check = () => setIsMobile(window.innerWidth &lt; breakpoint); check(); window.addEventListener('resize', check); return () =&gt; window.removeEventListener('resize', check); }, \[breakpoint\]); return isMobile; }

## **7.3 Pattern per grid responsive con inline styles**

**Esempio pratico - Stats grid**

// Invece di: gridTemplateColumns: 'repeat(3, 1fr)' // Usare: gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)'

## **7.4 CSS alternativo per dashboard sidebar**

**Approccio CSS-only con Tailwind**

// La sidebar può essere gestita interamente con classi Tailwind: // - hidden md:flex → nascosta su mobile, visibile su md+ // - fixed inset-y-0 left-0 z-50 → overlay mobile // - translate-x-full → nascondi fuori schermo // - translate-x-0 → mostra

# **8\. Conclusioni**

I problemi identificati riguardano principalmente le pagine di gestione (Homepage, Dashboard) e non il menù visualizzato dal cliente finale (già discretamente ottimizzato in MenuRenderer). Le priorità di intervento sono:

- IMMEDIATE (Fase 1): Navbar hamburger + Footer grid + Prezzi grid + Dashboard sidebar drawer. Impatto altissimo sull'uso quotidiano del ristoratore mobile.
- BREVE TERMINE (Fase 2): Touch targets, grids KPI, onboarding template. Migliorano UX senza essere bloccanti.
- MEDIO TERMINE (Fase 3): next/image, safe-area, login form. Ottimizzazioni performance e polish.

Con l'implementazione completa delle Fasi 1 e 2, il prodotto raggiungerà un livello di mobile responsiveness adeguato al suo target principale: ristoratori italiani che gestiscono il menù dal telefono.

_SmartMenu - Documento riservato uso interno - Aprile 2026_