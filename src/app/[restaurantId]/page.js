import MenuRenderer from '@/components/MenuRenderer';

// Questa funzione legge i dati dinamicamente per il ristorante richiesto
async function getRestaurantData(restaurantId) {
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  // Assicura che l'URL includa l'ID del ristorante corretto
  const url = `${protocol}://localhost:3000/api/menu?restaurantId=${restaurantId}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function RestaurantMenu(props) {
  const params = await props.params;
  const restaurantId = params.restaurantId;
  const data = await getRestaurantData(restaurantId);

  // Fallback se il ristorante non esiste o non ha pubblicato nulla
  if (!data || !data.menu) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-4 grayscale opacity-50">🧭</span>
        <h1 className="text-2xl font-serif text-[#e0dfdc]">Menù Non Trovato</h1>
        <p className="text-[#a19f9b] mt-2">Sembra che questo ristorante non esista o non abbia ancora pubblicato il menù.</p>
      </div>
    );
  }

  const { menu, settings } = data;

  return <MenuRenderer menu={menu} settings={settings} restaurantId={restaurantId} />;
}
