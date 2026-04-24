import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId richiesto' }, { status: 400 });

  try {
    const { data, error } = await supabase
      .from('menus')
      .select('data')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error || !data) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Supabase GET Error:", error);
    return NextResponse.json(null);
  }
}

export async function POST(request) {
  try {
    const { restaurantId, data, userId } = await request.json();
    if (!restaurantId) return NextResponse.json({ success: false, error: 'restaurantId mancante' }, { status: 400 });

    // Fetch existing menu to preserve user_id if present
    const { data: existingMenu } = await supabase
      .from('menus')
      .select('user_id')
      .eq('restaurant_id', restaurantId)
      .single();

    const finalUserId = userId || (existingMenu?.user_id) || null;

    const { error } = await supabase
      .from('menus')
      .upsert({
        restaurant_id: restaurantId,
        data: data,
        user_id: finalUserId
      });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Menù salvato con successo su Supabase!' });
  } catch (error) {
    console.error("Supabase POST Error:", error);
    return NextResponse.json({ success: false, error: 'Errore durante il salvataggio su Supabase' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    if (!restaurantId) return NextResponse.json({ success: false, error: 'restaurantId mancante' }, { status: 400 });

    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
