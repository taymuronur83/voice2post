import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt } = req.body;

  try {
    // 1. OPENAI: LinkedIn ve Twitter içeriği
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için LinkedIn postu ve Twitter akışı üret. JSON formatında ver: {"linkedin": "...", "twitter": "..."} Komut: ${prompt}` 
      }],
      response_format: { type: "json_object" }
    });
    const textData = JSON.parse(aiResponse.choices[0].message.content);

    // 2. CLAUDE: Remotion Video parametreleri (Senin index.html yapına uygun)
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için video parametreleri üret. JSON ver:
        {
          "title": "Ana Başlık",
          "sub": "Alt yazı",
          "accentColor": "#3b82f6",
          "animation": {"shakeIntensity": 2, "zoomScale": 1.2, "textSpeed": 1}
        }
        Komut: ${prompt}` 
      }],
    });
    const videoData = JSON.parse(msg.content[0].text.trim());

    // 3. index.html'in beklediği formatta dönüş yap
    return res.status(200).json({ 
      success: true, 
      linkedin: textData.linkedin, // index.html bunu bekliyor
      twitter: textData.twitter,   // index.html bunu bekliyor
      video_script: videoData      // index.html bunu bekliyor
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
