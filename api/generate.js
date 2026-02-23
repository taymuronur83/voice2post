import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;

  try {
    // 1. ADIM: Claude'dan tüm içerikleri JSON formatında istiyoruz
    // Bu sayede LinkedIn, Twitter ve Video metni tek seferde hatasız gelir.
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için sosyal medya içerikleri üret. 
        Cevabını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
        {
          "linkedin": "profesyonel ve uzun bir linkedin postu",
          "twitter": "dikkat çekici kısa bir X/twitter postu",
          "video_text": "video içinde animasyonla görünecek kısa ana metin"
        }
        
        Komut: ${prompt}` 
      }],
    });

    // Claude'dan gelen yanıtı JSON olarak ayrıştırıyoruz
    const responseText = msg.content[0].text.trim();
    const aiData = JSON.parse(responseText);

    // 2. ADIM: GitHub Workflow (Remotion) Tetikleme
    // Video render motoruna Claude'un ürettiği "video_text" bilgisini gönderiyoruz.
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
              text: aiData.video_text, // Remotion projen bu 'text' prop'unu okumalı
              title: "AI Content"
            }
          }
        }),
      }
    );

    // GitHub tetikleme kontrolü
    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error("GitHub API Hatası:", errorText);
    }

    // 3. ADIM: Frontend'e (index.tsx) tüm verileri gönder
    return res.status(200).json({ 
      success: true, 
      linkedinText: aiData.linkedin,
      twitterText: aiData.twitter,
      videoTitle: aiData.video_text 
    });

  } catch (error) {
    console.error("Sistem Hatası:", error);
    return res.status(500).json({ 
      success: false, 
      error: "İçerik üretiminde veya GitHub bağlantısında hata oluştu." 
    });
  }
}
