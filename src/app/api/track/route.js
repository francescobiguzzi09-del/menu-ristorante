import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper per aggiornare il database dedicato analytics
export async function POST(request) {
  try {
    const { event, restaurantId, itemId, duration, query } = await request.json();

    if (!restaurantId || restaurantId.startsWith('guest-')) {
      return NextResponse.json({ success: true, message: 'Guest tracked locally' });
    }

    // 1. Fetch current analytics data per quel ristorante
    const { data: row, error: fetchErr } = await supabase
      .from('analytics')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    // Se la tabella non esiste (o riga non trovata), prepariamo un record di base
    let analytics = {
       restaurant_id: restaurantId,
       views: 0,
       time_spent_total: 0,
       time_spent_count: 0,
       item_clicks: {},
       search_queries: {}
    };

    if (row && !fetchErr) {
       analytics = {
          restaurant_id: row.restaurant_id,
          views: row.views || 0,
          time_spent_total: row.time_spent_total || 0,
          time_spent_count: row.time_spent_count || 0,
          item_clicks: typeof row.item_clicks === 'object' && row.item_clicks !== null ? row.item_clicks : {},
          search_queries: typeof row.search_queries === 'object' && row.search_queries !== null ? row.search_queries : {}
       };
    }

    // 3. Process event
    if (event === 'page_view') {
       analytics.views += 1;
    } else if (event === 'item_click' && itemId) {
       analytics.item_clicks[itemId] = (analytics.item_clicks[itemId] || 0) + 1;
    } else if (event === 'search' && query) {
       const w = query.toLowerCase().trim();
       if (w.length > 2) {
          analytics.search_queries[w] = (analytics.search_queries[w] || 0) + 1;
       }
    } else if (event === 'time_spent' && duration) {
       analytics.time_spent_total += duration;
       analytics.time_spent_count += 1;
    }

    // 4. Upsert (Aggiorna se esiste, crea se non esiste) nel DB Supabase
    const { error: upsertErr } = await supabase
      .from('analytics')
      .upsert(analytics, { onConflict: 'restaurant_id' });

    if (upsertErr) {
       console.error("Upsert Analytics Table Error:", upsertErr);
       // Ignore upsert errors se l'utente non ha ancora creato la tabella!
    }

    return NextResponse.json({ success: true, message: 'Evento tracciato con successo', analytics });
  } catch (error) {
    console.error("Errore tracking Analytics DB:", error);
    return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 });
  }
}

