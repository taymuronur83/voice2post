const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

// Vercel ortam değişkenlerinden anahtarları alıyoruz
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    // API Anahtarı kontrolü
    if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ 
            error: "API anahtarları eksik! Vercel Dashboard > Settings > Environment Variables kısmına ekleyin." 
        });
    }

    const systemPromptClaude = `Sen bir video yönetmeni ve Remotion kurgu uzmanısın. 
    GÖREVİN: Kullanıcının komutunu analiz edip profesyonel bir video kurgusu JSON'ı üretmek.
    KURAL 1: SADECE JSON döndür. Markdown veya açıklama yazma.
    KURAL 2: Animasyon değerlerini konunun ciddiyetine göre belirle. 
    YAPI:
    {
      "video_script": {
        "text": "Ana başlık",
        "theme": "ekonomi/motive/teknoloji/siyaset",
        "accentColor": "#hex",
        "animation": {
          "shakeIntensity": 0-10,
          "zoomScale": 1.0-1.5,
          "textSpeed": 0.5-2.0
        }
      }
    }`;

    try {
        // PARALEL ÇALIŞMA: İki yapay zeka aynı anda çalışır
        const [oaiResponse, antResponse] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Sen bir sosyal medya uzmanısın. LinkedIn ve Twitter postları üret. SADECE JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                    { role: "user", content: `Konu: ${prompt}` }
                ],
                response_format: { type: "json_object" }
            }),
            anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1200,
                system: systemPromptClaude,
                messages: [{
                    role: "user",
                    content: `Komut: ${prompt}`
                }],
            })
        ]);

        // OpenAI Verisini İşle
        const oaiData = JSON.parse(oaiResponse.choices[0].message.content);
        
        // Claude Verisini İşle (Regex ile JSON temizleme garantisi)
        const antRawText = antResponse.content[0].text;
        const jsonMatch = antRawText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("Claude geçerli bir JSON üretmedi.");
        }
        
        const antData = JSON.parse(jsonMatch[0]);

        // Birleştirilmiş Yanıt (HTML'deki fonksiyonun beklediği format)
        return res.status(200).json({
            linkedin: oaiData.linkedin,
            twitter: oaiData.twitter,
            video_script: antData.video_script
        });

    } catch (error) {
        console.error("Vercel Backend Error:", error);
        return res.status(500).json({ 
            error: "İçerik üretiminde bir hata oluştu.",
            message: error.message 
        });
    }
}
