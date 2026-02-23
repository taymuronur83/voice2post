import { Anthropic } from '@anthropic-ai/sdk';

// 1. ADIM: Claude Ayarları (Mevcut olanları koru, yoksa bunları kullan)
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Geçersiz metod' });
  }

  const { prompt } = req.body;

  try {
    // --- WORKFLOW BAŞLANGICI ---
    
    // 2. ADIM: AI Veri Hazırlama (Claude)
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const aiContent = claudeResponse.content[0].text;

    // 3. ADIM: VİDEO RENDER İŞ AKIŞI (Remotion Bridge)
    // Bu kısım Claude'dan gelen veriyi videoya dönüştüren ana motor
    const renderAction = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compositionId: "SocialMediaVideo", // Remotion tarafındaki comp ismi
        inputProps: {
          text: aiContent, // Claude içeriği buraya basılıyor
          timestamp: Date.now() // Önbelleği temizlemek için zaman damgası
        }
      }),
    });

    const workflowOutput = await renderAction.json();

    // 4. ADIM: FRONTEND ENTEGRASYONU (Videonun Ekranda Belirmesi)
    if (workflowOutput && workflowOutput.url) {
      // WORKFLOW BAŞARILI: Veri tam halde arayüze döner
      return res.status(200).json({
        success: true,
        videoUrl: workflowOutput.url, // Bu URL videonun en önde gözükmesini sağlar
        aiText: aiContent,
        status: "READY_FOR_DISPLAY"
      });
    } else {
      // WORKFLOW KISMEN BAŞARILI: Video motoru hata verse de AI verisi kaybolmaz
      throw new Error("Render motoru URL dönmedi, akış kesildi.");
    }

  } catch (error) {
    console.error("Workflow Çökme Hatası:", error);
    // Sitemin kodlarını bozmadan hatayı döndür
    return res.status(500).json({
      success: false,
      message: "Workflow akışı tamamlanamadı.",
      details: error.message
    });
  }
}
