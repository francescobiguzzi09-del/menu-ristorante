import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { restaurantId, existingStripeAccountId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('inserisci_qui')) {
       return NextResponse.json({ success: false, error: "Chiavi Stripe non configurate nel file .env.local" }, { status: 500 });
    }

    if (!restaurantId) {
      return NextResponse.json({ success: false, error: "Restaurant ID mancante" }, { status: 400 });
    }

    let accountId = existingStripeAccountId;

    // Se il ristorante non ha ancora un account Stripe connesso, creamolo
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          restaurantId: restaurantId
        }
      });
      accountId = account.id;
    }

    // Crea un Account Link per l'onboarding (Express)
    // Usiamo origin o un base url di default
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/admin`, // dove mandarlo se scade o preme indietro
      return_url: `${origin}/admin?stripe_account=${accountId}`, // dove mandarlo dopo successo (leggeremo questo parametro in admin)
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      accountId: accountId
    });

  } catch (err) {
    console.error('Stripe Onboarding Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
