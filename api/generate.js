import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt } = req.body;

  try {
    // 1. CLAUDE'DAN NET JSON FORMATI İSTİYORUZ
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için içerik üret. Cevabını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
        {
          "linkedin": "linkedin postu buraya",
          "twitter": "twitter postu buraya",
          "video": "kısa video metni buraya"
        }
        Komut: ${prompt}` 
      }],
    });

    // Claude cevabını parse ediyoruz
    const aiResponse = JSON.parse(msg.content[0].text);

    // 2. GITHUB WORKFLOW TETİKLEME
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
              text: aiResponse.video,
            }
          }
        }),
      }
    );

    return res.status(200).json({ 
      success: true, 
      linkedinText: aiResponse.linkedin,
      twitterText: aiResponse.twitter,
      aiText: aiResponse.video
    });

  } catch (error) {
    console.error("API Hatası:", error);
    return res.status(500).json({ success: false, error: "Veri işlenemedi: " + error.message });
  }
}
