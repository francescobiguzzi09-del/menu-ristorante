import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('data')
      .eq('restaurant_id', 'platform_updates')
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
    
    return NextResponse.json({ success: true, updates: data?.data?.updates || [] });
  } catch (error) {
    console.error("Updates GET Error:", error);
    return NextResponse.json({ success: false, error: 'Errore nel caricamento degli aggiornamenti' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content, userEmail } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Titolo e contenuto sono obbligatori' }, { status: 400 });
    }

    if (userEmail !== 'francesco.biguzzi09@gmail.com') {
      return NextResponse.json({ success: false, error: 'Accesso negato: solo gli amministratori possono pubblicare aggiornamenti' }, { status: 403 });
    }

    // Fetch existing updates
    const { data: existingData } = await supabase
      .from('menus')
      .select('data')
      .eq('restaurant_id', 'platform_updates')
      .single();
      
    const updates = existingData?.data?.updates || [];
    
    const newUpdate = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      title,
      content,
      created_at: new Date().toISOString()
    };

    // Insert new update at the beginning
    const updatedData = { updates: [newUpdate, ...updates] };

    const { error } = await supabase
      .from('menus')
      .upsert({
        restaurant_id: 'platform_updates',
        data: updatedData,
        user_id: null // System row
      });

    if (error) throw error;

    return NextResponse.json({ success: true, update: newUpdate });
  } catch (error) {
    console.error("Updates POST Error:", error);
    return NextResponse.json({ success: false, error: 'Errore durante la pubblicazione' }, { status: 500 });
  }
}
