import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { prompt } = req.body;

    // A. CLAUDE VERİSİ OLUŞTURMA
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const aiContent = msg.content[0].text;

    // B. GITHUB WORKFLOW (render-video.yml) TETİKLEME
    // Bu kısım videonun render işlemini başlatır
    const githubResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'render-video', // .yml dosyasındaki on: workflow_dispatch ile eşleşmeli
        client_payload: {
          prompt: prompt,
          inputProps: { text: aiContent }
        }
      }),
    });

    // C. FRONTEND'E SİNYAL GÖNDERME
    return res.status(200).json({
      success: true,
      message: "İş akışı başlatıldı. Video birazdan ekranda belirecek.",
      content: aiContent
    });

  } catch (error) {
    console.error("HATA:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
