import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    // Se l'array di piatti non è stato fornito o è vuoto
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Nessun piatto da tradurre." }, { status: 400 });
    }
    
    // Controllo Sicurezza!
    const rawKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY; 
    if (!rawKey || rawKey.includes("inserisci_qui")) {
      return NextResponse.json({ success: false, error: "La chiave API OpenRouter non è stata inserita correttamente nel file .env.local" }, { status: 401 });
    }

    // Inizializza client OpenAI per usare OpenRouter
    const openai = new OpenAI({ 
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: rawKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Menu Ristorante Digital Translate",
      }
    });

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `You are an expert culinary translator. You will receive a JSON array of menu items.
STRICT RULES:
1. You must return EXACTLY the same JSON array structure, but you MUST add a new property "translations" to EVERY object.
2. The "translations" property MUST be a JSON object containing exactly these 4 keys: "en", "de", "fr", "es".
3. Inside each language key, translate the original "name", "description", and "category" from Italian.
4. Keep "id", "price", "image" and all other original fields unchanged.
5. If an item has no "description", the translation of the description must be an empty string "".
6. Return ONLY a valid JSON array. No markdown, no backticks, no \`\`\`json.`
        },
        {
          role: "user",
          content: JSON.stringify(items),
        },
      ],
      max_tokens: 3000,
      temperature: 0.1, // Deterministico e strutturato
    });

    const aiMessage = response.choices[0].message.content.trim();
    
    // Pulizia estrema del JSON qualora il modello ci mettesse dei backtick
    let jsonString = aiMessage;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let translatedItems = [];
    try {
      translatedItems = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Errore Parsing JSON OpenRouter (Translate):", aiMessage);
      return NextResponse.json({ success: false, error: "OpenRouter ha risposto, ma il formato non era un JSON valido." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: translatedItems
    });

  } catch (error) {
    console.error("OpenRouter API Translation Error:", error);
    return NextResponse.json({ success: false, error: "OpenRouter Error: " + (error.message || error.toString()) }, { status: 500 });
  }
}
