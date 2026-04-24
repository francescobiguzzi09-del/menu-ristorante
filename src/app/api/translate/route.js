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
3. Inside each language key, translate ONLY the "description", "category", and "ingredients" fields from Italian. Do NOT translate "name" — dish names must always stay in the original language.
4. Each language object must have exactly these keys: "description", "category", "ingredients". Do NOT include a "name" key.
5. Keep "id", "price", "image", "name" and all other original fields unchanged.
6. If an item has no "description", the translation of the description must be an empty string "".
7. If an item has no "ingredients", the translation of ingredients must be an empty string "".
8. You MUST return a JSON object with a single key "menu" containing the array of translated items. No markdown.`
        },
        {
          role: "user",
          content: JSON.stringify(items),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 10000,
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
      const parsed = JSON.parse(jsonString);
      translatedItems = parsed.menu || parsed;
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
