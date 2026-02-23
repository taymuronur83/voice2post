import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt } = req.body;

  try {
    // 1. OPENAI: SOSYAL MEDYA METİN ÜRETİMİ
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için LinkedIn ve Twitter içeriği üret. JSON formatında ver: {"linkedin": "...", "twitter": "..."} Komut: ${prompt}` 
      }],
      response_format: { type: "json_object" }
    });
    const textData = JSON.parse(aiResponse.choices[0].message.content);

    // 2. CLAUDE: REMOTION VİDEO İÇERİK ÜRETİMİ
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için Remotion video parametreleri üret. Cevabı SADECE şu JSON ile ver:
        {
          "videoTitle": "Ana Metin",
          "subTitle": "Alt Metin",
          "accentColor": "#3b82f6",
          "animation": {"shakeIntensity": 2, "zoomScale": 1.2}
        }
        Komut: ${prompt}` 
      }],
    });
    const videoData = JSON.parse(msg.content[0].text.trim());

    return res.status(200).json({ 
      success: true, 
      linkedinText: textData.linkedin,
      twitterText: textData.twitter,
      videoTitle: videoData.videoTitle,
      video_script: {
        title: videoData.videoTitle,
        sub: videoData.subTitle,
        accentColor: videoData.accentColor,
        animation: videoData.animation
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
