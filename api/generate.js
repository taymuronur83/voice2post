import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const msg = await anthropic.messages.create({
      // GARANTİ ÇALIŞAN MODEL: Haiku her hesapta açıktır ve çok hızlıdır.
      model: "claude-3-haiku-20240307", 
      max_tokens: 4000,
      temperature: 0.7,
      system: `Sen profesyonel bir içerik üreticisisin. Yanıtını şu yapıda ver:
      LinkedIn: [LinkedIn içeriği]
      Twitter: [Twitter içeriği]
      VideoScript: {"title": "Başlık", "subtitles": [{"text": "Söz", "start": 0, "end": 2}]}`,
      messages: [{ role: "user", content: `Şu metni işle: ${prompt}` }],
    });

    const responseText = msg.content[0].text;
    
    // Verileri HTML id'lerine göre parçalıyoruz
    const linkedin = responseText.match(/LinkedIn:\s*([\s\S]*?)(?=Twitter:|$)/)?.[1]?.trim();
    const twitter = responseText.match(/Twitter:\s*([\s\S]*?)(?=VideoScript:|$)/)?.[1]?.trim();
    const videoScriptRaw = responseText.match(/VideoScript:\s*(\{[\s\S]*\})/)?.[1]?.trim();

    res.status(200).json({
      linkedin: linkedin || "İçerik hazırlanamadı.",
      twitter: twitter || "İçerik hazırlanamadı.",
      video_script: videoScriptRaw ? JSON.parse(videoScriptRaw) : null
    });

  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "Sistem hatası: " + error.message });
  }
}
