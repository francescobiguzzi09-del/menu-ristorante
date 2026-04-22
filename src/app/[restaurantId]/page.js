import MenuRenderer from '@/components/MenuRenderer';

import { supabase } from '@/lib/supabase';

// Questa funzione legge i dati dinamicamente per il ristorante richiesto
async function getRestaurantData(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('data')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error || !data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error("Errore nel recupero dati:", error);
    return null;
  }
}

export default async function RestaurantMenu(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const restaurantId = params.restaurantId;
  const isPrint = searchParams?.print === 'true';
  const data = await getRestaurantData(restaurantId);

  // Fallback se il ristorante non esiste o non ha pubblicato nulla
  if (!data || !data.menu) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-4 grayscale opacity-50">&#128715;</span>
        <h1 className="text-2xl font-serif text-[#e0dfdc]">Menu Non Trovato</h1>
        <p className="text-[#a19f9b] mt-2">Sembra che questo ristorante non esista o non abbia ancora pubblicato il menu.</p>
      </div>
    );
  }

  const { menu, settings } = data;

  return <MenuRenderer menu={menu} settings={settings} restaurantId={restaurantId} printMode={isPrint} />;
}
