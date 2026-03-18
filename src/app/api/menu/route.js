import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId richiesto' }, { status: 400 });

  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'db.json');
  try {
    if (!fs.existsSync(dataFilePath)) return NextResponse.json(null);
    const db = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    return NextResponse.json(db[restaurantId] || null);
  } catch (error) {
    return NextResponse.json(null);
  }
}

export async function POST(request) {
  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'db.json');
  try {
    const { restaurantId, data } = await request.json();
    if (!restaurantId) return NextResponse.json({ success: false, error: 'restaurantId mancante' }, { status: 400 });

    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let db = {};
    if (fs.existsSync(dataFilePath)) {
      db = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }

    db[restaurantId] = data;

    fs.writeFileSync(dataFilePath, JSON.stringify(db, null, 2), 'utf8');
    return NextResponse.json({ success: true, message: 'Menù salvato con successo!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Errore durante il salvataggio' }, { status: 500 });
  }
}
