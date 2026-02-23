import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });

  try {
    const { prompt } = req.body;

    // 1. CLAUDE VERİYİ ÜRETİR
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: `Social media video script: ${prompt}` }],
    });
    const aiContent = msg.content[0].text;

    // 2. GITHUB WORKFLOW TETİKLER (VIDEO MOTORU)
    const githubResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'render-video',
          client_payload: { inputProps: { text: aiContent } }
        }),
      }
    );

    if (!githubResponse.ok) throw new Error("GitHub bağlantısı başarısız.");

    return res.status(200).json({ success: true, aiText: aiContent });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
