import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image } = body;

    // Se l'immagine non è stata fornita
    if (!image) {
      return NextResponse.json({ success: false, error: "Nessuna immagine ricevuta." }, { status: 400 });
    }
    
    // Controllo Sicurezza!
    const rawKey = process.env.OPENAI_API_KEY;
    if (!rawKey || rawKey.includes("inserisci_qui")) {
      return NextResponse.json({ success: false, error: "La chiave API OpenRouter non è stata inserita correttamente nel file .env.local" }, { status: 401 });
    }

    // Inizializza client OpenAI per usare OpenRouter
    const openai = new OpenAI({ 
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: rawKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // Consigliato per OpenRouter
        "X-Title": "Menu Ristorante Digital", // Opzionale per OpenRouter
      }
    });

    const response = await openai.chat.completions.create({
      // Usiamo gpt-4o-mini tramite OpenRouter
      model: "openai/gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `Sei un eccellente estrattore di dati (OCR). Il tuo compito è estrarre un menù da un'immagine e categorizzare accuratamente ogni piatto.
REGOLE STRETTISSIME:
1. Restituisci ESCLUSIVAMENTE codice JSON puro. Assolutamente NESSUN testo prima o dopo. Nessun backtick o blocco markdown (non restituire \`\`\`json).
2. Il formato deve essere UN ARRAY DI OGGETTI, del tipo:
[
  { "name": "Pizza", "description": "Pomodoro, mozzarella", "price": 6.50, "category": "Pizze" }
]
3. Se un elemento non ha descrizione, usa una stringa vuota "".
4. "price" deve essere un NUMERO puro (float), es: 5.50 e non "5.50$".
5. Dividi logicamente le "category" se percepisci sezioni nell'immagine (es. Antipasti, Primi, Salads).
6. IMPORTANTISSIMO: NON INCLUDERE assolutamente l'ACQUA o le bevande generiche come l'acqua e NON INCLUDERE il COPERTO / SERVIZIO. Ignorali completamente e non inserirli nel JSON.
          `
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Estrai il menu da questa foto e restituiscicelo in array JSON." },
            {
              type: "image_url",
              image_url: { "url": image },
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0.1, // JSON altamente deterministico
    });

    const aiMessage = response.choices[0].message.content.trim();
    
    // Pulizia estrema del JSON qualora il modello ci mettesse dei backtick
    let jsonString = aiMessage;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let generatedItems = [];
    try {
      generatedItems = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Errore Parsing JSON OpenRouter:", aiMessage);
      return NextResponse.json({ success: false, error: "OpenRouter ha risposto, ma il formato non era decifrabile." }, { status: 500 });
    }

    // Aggiungi ID dinamico
    const finalItems = generatedItems.map((item, index) => ({
      ...item,
      id: "ai-" + Date.now() + "-" + index,
      price: parseFloat(item.price) || 0
    }));

    return NextResponse.json({
      success: true,
      data: finalItems
    });

  } catch (error) {
    console.error("OpenRouter API Global Error:", error);
    // Ora ti mostra il VERO errore sul popup così capiamo se è un limite di OpenRouter o altro
    return NextResponse.json({ success: false, error: "OpenRouter Error: " + (error.message || error.toString()) }, { status: 500 });
  }
}
