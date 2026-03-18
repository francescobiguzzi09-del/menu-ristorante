// Mock DB per SmartMenu AI
// In Next.js (App Router) in fase di sviluppo, le variabili globali persistono
// tra ricaricamenti caldi (Hot Reloads) permettendo di simulare un DB.

if (!globalThis.mockMenuStore) {
  globalThis.mockMenuStore = [
    {
      id: "1",
      nome: "Fiori di Zucca Fritti",
      prezzo: 8.0,
      descrizione: "Ripieni di ricotta al limone e acciughe.",
      categoria: "Antipasti",
    },
    {
      id: "2",
      nome: "Tagliere del Contadino",
      prezzo: 14.0,
      descrizione: "Salumi e formaggi del territorio con miele al tartufo.",
      categoria: "Antipasti",
    },
    {
      id: "3",
      nome: "Spaghetti alla Chitarra",
      prezzo: 13.5,
      descrizione: "Cacio, pepe e tartufo nero fresco.",
      categoria: "Primi",
    },
    {
      id: "4",
      nome: "Tagliata di Fassona",
      prezzo: 22.0,
      descrizione: "Con rucola selvatica, grana e aceto balsamico DOP.",
      categoria: "Secondi",
    },
    {
      id: "5",
      nome: "Cheesecake Scomposta",
      prezzo: 6.5,
      descrizione: "Con coulisse di frutti rossi e crumble al pistacchio.",
      categoria: "Dolci",
    }
  ];
}

export function getMenuItems() {
  return globalThis.mockMenuStore;
}

export function addMenuItem(item) {
  globalThis.mockMenuStore.push(item);
  return item;
}

export function deleteMenuItem(id) {
  globalThis.mockMenuStore = globalThis.mockMenuStore.filter(i => i.id !== id);
}
