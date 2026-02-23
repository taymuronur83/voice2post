import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;

  try {
    // 1. ADIM: Claude İçerik Üretimi
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: `Aşağıdaki komut için kısa bir video metni oluştur: ${prompt}` }],
    });
    const aiContent = msg.content[0].text;

    // 2. ADIM: GitHub Workflow Bridge (Workflow'un çalışması için burası şart)
    // ÖNEMLİ: GitHub Token'ın "repo" ve "workflow" izinlerine sahip olmalı.
    const githubResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Remotion-App' // GitHub bazen bunu zorunlu tutar
        },
        body: JSON.stringify({
          event_type: 'render-video', // .yml dosyasındaki types: [render-video] ile AYNI olmalı
          client_payload: {
            inputProps: {
              text: aiContent, // Remotion projen bu "text" prop'unu beklemeli
            }
          }
        }),
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.text();
      throw new Error(`GitHub Hatası: ${errorData}`);
    }

    return res.status(200).json({ 
      success: true, 
      aiText: aiContent,
      message: "Yapay zeka içeriği hazırladı ve video kuyruğa alındı." 
    });

  } catch (error) {
    console.error("Workflow Hatası:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
