import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { total, items, stripeAccountId, restaurantId } = await request.json();

    if (!stripeAccountId) {
      return NextResponse.json({ success: false, error: "Il ristorante non ha configurato i pagamenti." }, { status: 400 });
    }

    // Converti il total in centesimi per Stripe (es. 50.50 -> 5050)
    // Usa sempre il totale ricalcolato lato server in produzione, qui ci fidiamo del check basico
    const amountInCents = Math.round(total * 100);

    // Fee della Piattaforma: per esempio 5% + €0.50 fissi
    const feeInCents = Math.round(amountInCents * 0.05) + 50;

    // Genera numero d'ordine fittizio (es. #A12B)
    const orderNumber = '#' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Inserisce l'ordine come 'pending' nel database.
    // Il Webhook si occuperà di passarlo a 'pagato' una volta completato il checkout.
    const { data: orderData, error: dbError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        items: items,
        total: total,
        order_number: orderNumber,
        status: 'pending',
        payment_method: 'Stripe' // Placeholder
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Errore salvataggio ordine pending:", dbError);
      return NextResponse.json({ success: false, error: "Errore interno (DB)" }, { status: 500 });
    }

    // Crea un PaymentIntent inviando i fondi all'account connesso
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      application_fee_amount: feeInCents,
      transfer_data: {
        destination: stripeAccountId,
      },
      metadata: {
        order_db_id: orderData.id,
        restaurant_id: restaurantId,
        order_number: orderNumber
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderNumber: orderNumber
    });

  } catch (err) {
    console.error('PaymentIntent Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
