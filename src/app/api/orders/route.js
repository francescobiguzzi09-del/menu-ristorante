import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET: Recupera gli ordini per un ristorante
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');

  if (!restaurantId) {
    return NextResponse.json({ success: false, error: 'restaurantId richiesto' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .neq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, orders: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Crea un nuovo ordine
export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantId, items, total, tableNumber, paymentMethod } = body;

    if (!restaurantId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Dati ordine mancanti' }, { status: 400 });
    }

    // Genera un numero d'ordine breve es. #A42B
    const orderNumber = '#' + Math.random().toString(36).substr(2, 4).toUpperCase();

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        restaurant_id: restaurantId,
        items: items, // array of objects (id, name, quantity, price)
        total: parseFloat(total),
        order_number: orderNumber,
        table_number: tableNumber || null,
        payment_method: paymentMethod || 'Cartaceo',
        status: 'pending' // pending, completed
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Completa/Elimina un ordine
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId richiesto' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
