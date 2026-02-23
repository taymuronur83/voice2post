import { Anthropic } from '@anthropic-ai/sdk';

// 1. AYARLAR: Buradaki bilgilerin eksiksiz olduğundan emin ol
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY, // Claude anahtarın burada tanımlı olmalı
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    // --- ADIM 1: CLAUDE ÇALIŞTIRILIYOR ---
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: `Aşağıdaki komut için video içeriği oluştur: ${prompt}` }],
    });

    const aiText = msg.content[0].text;

    // --- ADIM 2: REMOTION TETİKLENİYOR ---
    // Burası videonun oluşup sana link döndüğü yerdir.
    const remotionResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compositionId: "SocialMediaVideo", // Remotion'daki Composition ID ile aynı olmalı
        inputProps: {
          videoText: aiText,
          // Buraya başka parametreler (renk, müzik vb.) ekleyebilirsin
        }
      }),
    });

    const renderResult = await remotionResponse.json();

    // --- ADIM 3: SONUÇLARI FRONTEND'E GÖNDER ---
    if (renderResult && renderResult.url) {
      // BAŞARILI: Video URL'si ve AI metni beraber döner
      return res.status(200).json({
        success: true,
        url: renderResult.url, // BU LİNK VİDEONUN KENDİSİDİR
        text: aiText
      });
    } else {
      // VİDEO OLUŞMADIYSA BİLE HATA VERME, METNİ DÖNDÜR SİSTEM ÇÖKMESİN
      return res.status(200).json({
        success: true,
        text: aiText,
        error: "Video motoru meşgul, metin hazır."
      });
    }

  } catch (error) {
    console.error("Sistem Hatası:", error);
    return res.status(500).json({
      success: false,
      error: "Yapay zeka veya Render motoru şu an kapalı.",
      details: error.message
    });
  }
}
