import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Il webhook secret te lo fornirà la Stripe CLI durante i test in locale (es. whsec_...)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    const rawBody = await request.text();

    if (endpointSecret) {
      // In ambiente di produzione o con CLI attivo
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      // Per sviluppo molto basico senza signature validation (NON FARE IN PROD)
      event = JSON.parse(rawBody);
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Gestisci l'evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Pagamento completato!', paymentIntent.id);

      // Estraiamo i metadati che avevamo salvato nel create-payment-intent
      const orderDbId = paymentIntent.metadata.order_db_id;
      
      if (orderDbId) {
        // Aggiorniamo l'ordine su Supabase da 'pending' a 'pagato'
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'pagato',
            payment_method: paymentIntent.payment_method_types?.[0] || 'stripe'
          })
          .eq('id', orderDbId);

        if (error) {
          console.error("Errore aggiornamento ordine post-webhook:", error);
        }
      }
      break;
    
    // Puoi gestire altri eventi (es. rimborso, payment_intent.payment_failed)
    default:
      console.log(`Evento non gestito: ${event.type}`);
  }

  // Ritorna un 200 a Stripe per indicare che abbiamo ricevuto l'evento
  return NextResponse.json({ received: true });
}
