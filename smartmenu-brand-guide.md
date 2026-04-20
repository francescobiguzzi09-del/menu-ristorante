# SmartMenu AI — Brand Guide & Redesign Roadmap

---

## 1. Il problema da risolvere

Il sito attuale usa la combinazione `slate-900 / indigo-600 / bg-slate-50` con
Tailwind defaults — esattamente il pattern che produce il 90% dei micro-SaaS
italiani generati con AI nel 2024-25. Non esiste un colore brand, un font
caratteristico, né un elemento grafico riconoscibile.

**Obiettivo:** passare da "SaaS generico" a "brand riconoscibile per ristoratori italiani".

---

## 2. Nuova palette cromatica

| Nome       | Hex       | Uso                                      |
|------------|-----------|------------------------------------------|
| Espresso   | `#2D2016` | Sfondi hero, header, CTA scure           |
| Terracotta | `#C4622D` | Colore brand primario, CTA, accenti      |
| Ambra      | `#E8A84A` | Badge, stelle, highlights warm           |
| Oliva      | `#4A7C59` | Check, conferme, elementi positivi       |
| Crema      | `#F5F0E8` | Background pagina, testo su scuro        |
| Carbone    | `#2C2C2A` | Testo body su sfondi chiari              |

**Razionale:** ogni colore richiama materiali fisici della ristorazione —
legno bruciato, terracotta, maiolica, olive. Nessun indigo, nessuno slate.

---

## 3. Tipografia

### Display / Headlines
- **Font:** Fraunces (Google Fonts, serif variabile)
- **Peso:** 500 (regular)
- **Uso:** H1, H2, numeri grandi, citazioni

```css
/* In layout.js (Next.js) */
import { Fraunces } from 'next/font/google'
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '700']
})
```

### Body / UI
- **Font:** Geist (già incluso in Next.js) o Inter
- **Peso:** 400 regular, 500 medium
- **Uso:** testo corrente, label, UI

### Abbinamento
La combinazione Fraunces (warm serif) + Geist (geometric sans) crea il
contrasto giusto tra carattere artigianale e funzionalità moderna.

---

## 4. Logo concept

**Forma:** griglia 2×2 ispirata al QR code e alla divisione delle portate  
**Colore:** Terracotta `#C4622D`  
**Wordmark:** "SmartMenu" in Fraunces 500, letterspacing -0.5px

**Invece di:** scalare il logo 2.5x con `scale-[2.5]` — ridisegnarlo vettoriale
in SVG o acquistare un'icona su Noun Project / Iconoir.

---

## 5. Struttura homepage (7 sezioni)

```
1. HERO
   ├── Badge: "Usato da 500+ ristoranti italiani"
   ├── Headline: "Il tuo menù è il primo assaggio. Fallo valere."
   ├── CTA primaria: "Crea il menù gratis →"
   └── 5 feature check (nessuna app, QR incluso, 10 lingue...)

2. SOCIAL PROOF
   └── 3 stat card con numeri REALI e fonte dichiarata

3. COME FUNZIONA (3 step)
   ├── Scatta o carica una foto
   ├── L'AI costruisce il menù
   └── Condividi il QR code

4. TEMPLATE PREVIEW
   └── 6 anteprima visiva dei template disponibili

5. TESTIMONIANZE
   └── 3 recensioni con: nome, ristorante, città, tipo di locale, testo

6. PREZZI (sezione pubblica /prezzi o anchor #prezzi)
   ├── Piano Gratis — €0 / sempre
   └── Piano Pro — €19 / mese

7. CTA FINALE
   └── "Il tuo ristorante merita un menù all'altezza."
```

---

## 6. Tono di voce — regole

### Evitare (AI generico)
- "Trasforma la foto del tuo vecchio menù cartaceo in un'esperienza digitale bellissima"
- "Ricco di funzioni per il tuo locale"
- "Il menù digitale del presente è qui"
- "Generazione Grafica basata sull'AI"

### Usare (voce propria)
- Frasi corte. Verbi attivi. Niente aggettivi vuoti.
- Parlare al ristoratore come a un pari, non come a un cliente
- Beneficio concreto prima della feature tecnica
- Specificità > grandiosità ("30 secondi per aggiornare il prezzo" > "aggiornamenti istantanei")

### Esempi di trasformazione
| Prima | Dopo |
|-------|------|
| "Esperienza digitale bellissima" | "Un menù che i clienti ricordano" |
| "Ricco di funzioni" | "Ogni tavolo, ogni lingua, ogni piatto" |
| "Badge allergeni generati in automatico" | "Niente più 'è senza glutine?' — ci pensa l'AI" |
| "Punteggio Interno 4.9/5" | "4.8★ da 120 ristoratori (fonte: Google Forms)" |

---

## 7. Social proof — come renderla credibile

### Cosa NON funziona (attuale)
- Numeri senza fonte ("524 menù creati")
- "Punteggio Interno" — suona inventato
- Nessun nome, nessun volto, nessun ristorante reale

### Cosa funziona
1. **3-5 ristoratori reali** con: nome, cognome, nome locale, città, foto o avatar
2. **Numeri specifici**: "fatturato da asporto +20%" batte "ottimi risultati"
3. **Loghi di ristoranti noti** nella tua area — anche uno solo conosciuto vale molto
4. **Integrare Google Reviews o Trustpilot** widget per review verificabili

---

## 8. SEO — parole chiave prioritarie

| Keyword                          | Volume est. | Difficoltà |
|----------------------------------|-------------|------------|
| menù digitale ristorante         | Alto        | Media      |
| qr code menù ristorante          | Alto        | Bassa      |
| menù digitale gratis             | Medio       | Bassa      |
| menù digitale con ordini tavolo  | Medio       | Bassa      |
| menù qr code allergeni           | Basso       | Molto bassa|

**Azioni:**
- Creare una pagina `/blog` con almeno 3 articoli targetizzati
- Ottimizzare meta title/description di ogni pagina
- Aggiungere schema markup `Restaurant` e `SoftwareApplication`

---

## 9. Social media — strategia minima

### Instagram (priorità 1)
- **Frequenza:** 3 post/settimana
- **Contenuti:**
  - Before/after: foto menù cartaceo → menù digitale
  - Screenshot di menù belli creati dagli utenti
  - Tips per ristoratori ("come scrivere la descrizione di un piatto")
  - Repost delle storie dei ristoranti clienti
- **Hashtag:** #menudigitale #ristorazione #ristorante #menuQR #digitalizzazione

### TikTok (priorità 2 — alto potenziale)
- Video "crea un menù in 2 minuti" — formato tutorial
- Prima/dopo con transizione

---

## 10. Fix rapide da fare subito

| Priorità | Fix | Impatto | Tempo stimato |
|----------|-----|---------|---------------|
| 🔴 CRITICO | Correggere "fuziona" → "funziona" in FAQ | Alto | 2 min |
| 🔴 CRITICO | Creare sezione /prezzi pubblica collegata al nav | Alto | 2 ore |
| 🔴 CRITICO | Aggiungere sezioni mancanti alla homepage | Alto | 1 giorno |
| 🟡 GRAVE | Sostituire social proof con dati reali | Alto | 1 settimana |
| 🟡 GRAVE | Collegare profili social reali nel footer | Medio | 30 min |
| 🟡 GRAVE | Riscrivere headline con benefit, non feature | Alto | 2 ore |
| 🔵 MEDIO | Importare font Fraunces in layout.js | Medio | 30 min |
| 🔵 MEDIO | Cambiare palette da slate/indigo a brand colors | Alto | 4 ore |
| 🔵 MEDIO | Ridisegnare logo come SVG vettoriale | Medio | 1 giorno |

---

## 11. Stack raccomandato per il redesign

| Obiettivo | Strumento |
|-----------|-----------|
| Design UI | Figma (gratis) con libreria Geist |
| Font | Fraunces via `next/font/google` |
| Icone | Lucide (già usato) + Phosphor Icons |
| Animazioni | Framer Motion (già compatibile con Next.js) |
| Heatmap post-lancio | Hotjar (piano free) o Microsoft Clarity (gratis) |
| A/B test headline | Vercel Edge Middleware + feature flags |
| Review verificabili | Trustpilot widget o Google Reviews API |

---

*Generato come parte dell'analisi di redesign SmartMenu AI — Aprile 2026*
