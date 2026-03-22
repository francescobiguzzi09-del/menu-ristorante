import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, currentDescription } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nome piatto richiesto." }, { status: 400 });
    }

    const rawKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!rawKey || rawKey.includes("inserisci_qui")) {
      return NextResponse.json({ success: false, error: "Chiave API OpenRouter non configurata." }, { status: 401 });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: rawKey,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Menu Ristorante Copy Generator",
      }
    });

    const prompt = currentDescription
      ? `Migliora e rendi piu persuasiva questa descrizione per il piatto "${name}" (categoria: ${category || 'non specificata'}). Descrizione corrente: "${currentDescription}". Riscrivila in italiano in modo accattivante, evocativo e appetitoso. Massimo 2 frasi brevi. Restituisci SOLO il testo della descrizione, nient'altro.`
      : `Scrivi una descrizione breve, accattivante e appetitosa in italiano per il piatto "${name}" (categoria: ${category || 'non specificata'}). Deve evocare sapori e far venire l'acquolina in bocca. Massimo 2 frasi brevi. Restituisci SOLO il testo della descrizione, nient'altro.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sei un copywriter esperto di ristorazione italiana. Scrivi descrizioni brevi, persuasive e appetitose per piatti di menu. Rispondi SOLO con il testo della descrizione, senza virgolette, senza prefissi, senza spiegazioni."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const description = response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({
      success: true,
      description
    });

  } catch (error) {
    console.error("OpenRouter API Copy Error:", error);
    return NextResponse.json({ success: false, error: "Errore IA: " + (error.message || error.toString()) }, { status: 500 });
  }
}
