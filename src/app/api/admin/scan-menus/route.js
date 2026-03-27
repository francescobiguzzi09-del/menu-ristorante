import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to extract text for scanning to save tokens
const extractMenuText = (menuData) => {
  if (!menuData) return '';
  let text = '';
  if (menuData.settings?.restaurantName) text += `Name: ${menuData.settings.restaurantName}\n`;
  if (Array.isArray(menuData.menu)) {
    menuData.menu.forEach(item => {
      text += `- ${item.name} (${item.category}): ${item.description}\n`;
    });
  }
  return text.substring(0, 1000); // Limit length per menu to avoid token limits
};

export async function POST(req) {
  try {
    // In a production app, verify the admin session here using supabase-auth-helpers
    // For now, we fetch all menus
    const { data: menus, error } = await supabase.from('menus').select('restaurant_id, data, user_id');
    
    if (error) throw error;
    if (!menus || menus.length === 0) {
      return NextResponse.json({ success: true, report: [] });
    }

    // Build the payload
    const menusToScan = menus.map(m => ({
      id: m.restaurant_id,
      user_id: m.user_id,
      content: extractMenuText(m.data)
    })).filter(m => m.content.trim().length > 0);

    if (menusToScan.length === 0) {
      return NextResponse.json({ success: true, report: [] });
    }

    // Call OpenRouter / OpenAI
    const openRouterApiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ success: false, error: 'API Key mancante nelle variabili d\'ambiente' }, { status: 500 });
    }

    const aiPrompt = `
      You are an automated moderation system for a Digital Restaurant Menu platform.
      Review the following list of menus. Identify any menu that contains profanities, strictly illegal content, extreme slurs, or blatant troll/spam data.
      Ignore minor typos or weird food names if they are harmless. Only focus on medium or high severity issues.
      
      Respond strictly with a valid JSON array of objects. Each object must have:
      - "id": the id of the menu
      - "user_id": the user_id provided
      - "severity": "alta" or "media" (do not include "bassa" or harmless things, just ignore them completely).
      - "reason": a short explanation in Italian of why it was flagged.
      - "snippet": the exact word, phrase or sentence from the menu that triggered the violation.
      
      If NO menus are suspicious or have high/medium severity violations, respond with an empty JSON array: []
      
      Menus to scan:
      ${JSON.stringify(menusToScan)}
    `;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: aiPrompt }]
      })
    });

    const aiData = await aiResponse.json();
    let report = [];
    
    try {
      // Parse the JSON. Gemini might wrap it in an object like { "flagged_menus": [...] } or output the array directly.
      const textResponse = aiData.choices[0].message.content.trim();
      const parsed = JSON.parse(textResponse);
      
      if (Array.isArray(parsed)) {
        report = parsed;
      } else if (parsed && typeof parsed === 'object') {
        // Find the first array property
        for (const key in parsed) {
          if (Array.isArray(parsed[key])) {
            report = parsed[key];
            break;
          }
        }
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      return NextResponse.json({ success: false, error: "L'IA non ha risposto in un formato JSON valido." });
    }

    return NextResponse.json({ success: true, report });

  } catch (err) {
    console.error("Scan Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
