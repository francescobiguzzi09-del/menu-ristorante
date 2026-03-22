import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET: Recupera recensioni per un ristorante
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');

  if (!restaurantId) {
    return NextResponse.json({ success: false, error: 'restaurantId richiesto' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, reviews: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Salva una nuova recensione
export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantId, stars, comment, customerName } = body;

    if (!restaurantId || !stars) {
      return NextResponse.json({ success: false, error: 'restaurantId e stelle richiesti' }, { status: 400 });
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json({ success: false, error: 'Le stelle devono essere tra 1 e 5' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        restaurant_id: restaurantId,
        stars: parseInt(stars),
        comment: comment?.trim() || null,
        customer_name: customerName?.trim() || 'Anonimo'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
