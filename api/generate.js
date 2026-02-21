Import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // CORS ve Metod Kontrolü
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const msg = await anthropic.messages.create({
      // Tier 1 hesaplar için en stabil ve güncel Claude 3.5 Sonnet ID'si kullanıldı:
      model: "claude-3-5-sonnet-20240620", 
      max_tokens: 4000,
      temperature: 0.7,
      system: `Sen profesyonel bir sosyal medya uzmanısın. Kullanıcının sesli notunu veya metnini alıp 3 farklı formata dönüştürürsün:
      1. LinkedIn Postu (Profesyonel, emojili, kancalı giriş).
      2. X (Twitter) Akışı (En az 3 tweetlik seri).
      3. Video Script (JSON formatında, Remotion projesine uygun).
      
      Yanıtını MUTLAKA şu yapıda vermelisin:
      LinkedIn: [Metin]
      Twitter: [Metin]
      VideoScript: {"title": "...", "subtitles": [{"text": "...", "start": 0, "end": 2}]}`,
      messages: [
        {
          role: "user",
          content: `Şu içeriği işle: ${prompt}`
        }
      ],
    });

    const responseText = msg.content[0].text;

    // HTML kodundaki (linkedin-res, x-res) id'leri ile tam uyumlu parçalama
    const linkedin = responseText.match(/LinkedIn:\s*([\s\S]*?)(?=Twitter:|$)/)?.[1]?.trim();
    const twitter = responseText.match(/Twitter:\s*([\s\S]*?)(?=VideoScript:|$)/)?.[1]?.trim();
    const videoScriptRaw = responseText.match(/VideoScript:\s*(\{[\s\S]*\})/)?.[1]?.trim();

    let parsedVideoScript = null;
    try {
      if (videoScriptRaw) parsedVideoScript = JSON.parse(videoScriptRaw);
    } catch (e) {
      console.error("JSON Parse Hatası:", e);
    }

    // Frontend'deki processAIResult fonksiyonunun beklediği JSON yapısı
    res.status(200).json({
      linkedin: linkedin || "LinkedIn içeriği oluşturulamadı.",
      twitter: twitter || "Twitter içeriği oluşturulamadı.",
      video_script: parsedVideoScript
    });

  } catch (error) {
    console.error("Anthropic API Hatası:", error);
    
    // Eğer hala 404 hatası alırsan (API yetkisi kaynaklı), kullanıcıyı bilgilendir
    if (error.message.includes("not_found") || error.message.includes("permission")) {
       return res.status(404).json({ 
         error: "Sizin API anahtarınız henüz Claude 3.5 sürümünü desteklemiyor olabilir. Lütfen 'claude-3-haiku-20240307' modelini deneyin veya Anthropic panelinden kredi yükleyin." 
       });
    }

    res.status(500).json({ error: "Yapay zeka yanıt veremedi: " + error.message });
  }
}
