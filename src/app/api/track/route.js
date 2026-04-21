import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper per aggiornare il database dedicato analytics
export async function POST(request) {
  try {
    const { event, restaurantId, itemId, duration, query, timezone } = await request.json();

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
       search_queries: {},
       daily_views: {}
    };

    if (row && !fetchErr) {
       analytics = {
          restaurant_id: row.restaurant_id,
          views: row.views || 0,
          time_spent_total: row.time_spent_total || 0,
          time_spent_count: row.time_spent_count || 0,
          item_clicks: typeof row.item_clicks === 'object' && row.item_clicks !== null ? row.item_clicks : {},
          search_queries: typeof row.search_queries === 'object' && row.search_queries !== null ? row.search_queries : {},
          daily_views: typeof row.daily_views === 'object' && row.daily_views !== null ? row.daily_views : {}
       };
    }

    // 2. Determine the current date in the visitor's timezone
    //    The client sends their IANA timezone (e.g. "Europe/Rome", "America/New_York")
    const tz = timezone || 'Europe/Rome';
    const now = new Date();
    // Format as YYYY-MM-DD in the visitor's timezone
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz }); // en-CA gives YYYY-MM-DD format

    // 3. Process event
    if (event === 'page_view') {
       analytics.views += 1;
       // Increment the daily counter for today
       analytics.daily_views[todayStr] = (analytics.daily_views[todayStr] || 0) + 1;
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

    // 4. Cleanup: remove daily_views entries older than 8 days
    //    (keep 8 days to ensure full coverage across all timezones)
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 8);
    const cutoffStr = cutoffDate.toLocaleDateString('en-CA', { timeZone: tz });

    const cleanedDailyViews = {};
    for (const [dateKey, count] of Object.entries(analytics.daily_views)) {
       if (dateKey >= cutoffStr) {
          cleanedDailyViews[dateKey] = count;
       }
    }
    analytics.daily_views = cleanedDailyViews;

    // 5. Upsert (Aggiorna se esiste, crea se non esiste) nel DB Supabase
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
