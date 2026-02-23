import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;

  try {
    // 1. CLAUDE İÇERİK ÜRETİMİ (LinkedIn, Twitter ve Video Metni)
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için içerik üret. Cevabını SADECE şu JSON formatında ver, başka hiçbir açıklama ekleme:
        {
          "linkedin": "profesyonel linkedin postu",
          "twitter": "dikkat çekici twitter postu",
          "video": "video içinde görünecek kısa metin"
        }
        Komut: ${prompt}` 
      }],
    });

    const aiData = JSON.parse(msg.content[0].text.trim());

    // 2. GITHUB WORKFLOW (REMOTION) TETİKLEME
    const githubResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Remotion-App'
        },
        body: JSON.stringify({
          event_type: 'render-video', 
          client_payload: {
            inputProps: {
              text: aiData.video, // Remotion projesine giden metin
            }
          }
        }),
      }
    );

    // 3. FRONTEND'E TAM VERİ GÖNDERİMİ
    return res.status(200).json({ 
      success: true, 
      linkedinText: aiData.linkedin,
      twitterText: aiData.twitter,
      videoTitle: aiData.video
    });

  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
