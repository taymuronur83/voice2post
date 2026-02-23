import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body;

  try {
    // 1. ADIM: Claude'un Üçlü İçerik Üretmesi (LinkedIn, Twitter, Video)
    // Claude'dan veriyi belirli bir formatta istiyoruz ki aşağıda parçalayabilelim.
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      messages: [{ 
        role: "user", 
        content: `Aşağıdaki komut için 3 farklı içerik üret:
        1. Profesyonel bir LinkedIn postu.
        2. Dikkat çekici bir X (Twitter) postu.
        3. Video içinde görünecek çok kısa bir metin.
        
        Yanıtını tam olarak şu formatta ver, aralara sadece "###" koy:
        LINKEDIN_BURAYA ### TWITTER_BURAYA ### VIDEO_BURAYA
        
        Komut: ${prompt}` 
      }],
    });

    const rawContent = msg.content[0].text;
    const parts = rawContent.split('###');
    
    // İçerikleri parçalara ayırıyoruz
    const linkedinText = parts[0]?.trim() || "LinkedIn içeriği üretilemedi.";
    const twitterText = parts[1]?.trim() || "Twitter içeriği üretilemedi.";
    const videoText = parts[2]?.trim() || "Video metni üretilemedi.";

    // 2. ADIM: GitHub Workflow Bridge (Video Render Tetikleme)
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
              text: videoText, // Remotion projesine giden asıl metin
              title: "Yeni İçerik",
              accentColor: "#2563eb"
            }
          }
        }),
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.text();
      throw new Error(`GitHub Hatası: ${errorData}`);
    }

    // 3. ADIM: Tüm içerikleri Frontend'e (index.tsx) gönderiyoruz
    return res.status(200).json({ 
      success: true, 
      linkedinText: linkedinText,
      twitterText: twitterText,
      aiText: videoText, // Player önizlemesi için
      message: "İçerikler üretildi ve video kuyruğa alındı." 
    });

  } catch (error) {
    console.error("Workflow Hatası:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
