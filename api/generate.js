import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { command } = req.body;

  try {
    // 1. ADIM: Claude içeriği üretir
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: command }],
    });
    const aiText = msg.content[0].text;

    // 2. ADIM: GitHub Workflow Tetikleme (Video Render Başlatma)
    const githubDispatch = await fetch(`https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'render-video',
        client_payload: {
          inputProps: { text: aiText },
          ref: 'main'
        }
      }),
    });

    // 3. ADIM: Kullanıcıya Yanıt Dön (Video Arka Planda Hazırlanıyor)
    return res.status(200).json({
      success: true,
      text: aiText,
      message: "Video oluşturma işlemi başlatıldı. Lütfen bekleyin."
    });

  } catch (error) {
    console.error("Workflow Hatası:", error);
    return res.status(500).json({ success: false, error: "Sistem başlatılamadı." });
  }
}
