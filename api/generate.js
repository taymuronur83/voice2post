import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Metin bulunamadı.' });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", 
      max_tokens: 4000,
      temperature: 0.7,
      system: "Sen profesyonel bir sosyal medya uzmanısın. LinkedIn postu, Twitter akışı ve VideoScript JSON verisi üretirsin. VideoScript kısmını her zaman geçerli ve tam bir JSON objesi olarak vermeye odaklan.",
      messages: [
        {
          role: "user",
          content: `Şu metni içeriklere dönüştür: ${prompt}. Yanıt formatını kesinlikle bozma:
          LinkedIn: [Metin]
          Twitter: [Metin]
          VideoScript: {
            "title": "Ana Başlık",
            "sub": "Alt Başlık veya Tema",
            "accentColor": "#3b82f6",
            "animation": {"shakeIntensity": 2, "zoomScale": 1.1, "textSpeed": 1}
          }`
        }
      ],
    });

    const content = msg.content[0].text;
    
    const linkedin = content.match(/LinkedIn:\s*([\s\S]*?)(?=Twitter:|$)/)?.[1]?.trim();
    const twitter = content.match(/Twitter:\s*([\s\S]*?)(?=VideoScript:|$)/)?.[1]?.trim();
    const videoScriptRaw = content.match(/VideoScript:\s*(\{[\s\S]*\})/)?.[1]?.trim();

    res.status(200).json({
      linkedin: linkedin || "LinkedIn metni hazırlanamadı.",
      twitter: twitter || "Twitter metni hazırlanamadı.",
      video_script: videoScriptRaw ? JSON.parse(videoScriptRaw) : null
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
