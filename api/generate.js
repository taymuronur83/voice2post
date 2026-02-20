const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ 
            error: "API anahtarları eksik! Vercel Dashboard > Settings > Environment Variables kısmına ekleyin." 
        });
    }

    const systemPromptClaude = `Sen bir video yönetmeni ve Remotion kurgu uzmanısın. 
    GÖREVİN: Kullanıcının komutunu analiz edip profesyonel bir video kurgusu JSON'ı üretmek.
    KURAL 1: SADECE JSON döndür. Markdown veya açıklama yazma.
    YAPI:
    {
      "video_script": {
        "text": "Ana başlık",
        "theme": "ekonomi",
        "accentColor": "#3b82f6",
        "animation": { "shakeIntensity": 2, "zoomScale": 1.2, "textSpeed": 1 }
      }
    }`;

    try {
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
                messages: [{ role: "user", content: `Komut: ${prompt}` }],
            })
        ]);

        // --- VERİ AYIKLAMA VE GÜVENLİK KATMANI ---
        let finalLinkedin = "İçerik üretilemedi.";
        let finalTwitter = "İçerik üretilemedi.";
        let finalVideoScript = null;

        // 1. OpenAI İşleme
        try {
            const oaiData = JSON.parse(oaiResponse.choices[0].message.content);
            // Case-insensitive (Büyük/küçük harf duyarsız) kontrol
            finalLinkedin = oaiData.linkedin || oaiData.LinkedIn || oaiData.post || finalLinkedin;
            finalTwitter = oaiData.twitter || oaiData.Twitter || oaiData.x || finalTwitter;
        } catch (e) { console.error("OpenAI JSON Hatası"); }

        // 2. Claude İşleme
        try {
            const antRawText = antResponse.content[0].text;
            const jsonMatch = antRawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const antData = JSON.parse(jsonMatch[0]);
                finalVideoScript = antData.video_script || antData;
            }
        } catch (e) { console.error("Claude JSON Hatası"); }

        // Varsayılan Video Script (Hata durumunda arayüzün çökmemesi için)
        if (!finalVideoScript) {
            finalVideoScript = {
                text: prompt.substring(0, 30),
                theme: "teknoloji",
                accentColor: "#3b82f6",
                animation: { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 }
            };
        }

        // HTML'E GÖNDERİLEN SON VERİ
        return res.status(200).json({
            linkedin: finalLinkedin,
            twitter: finalTwitter,
            video_script: finalVideoScript
        });

    } catch (error) {
        console.error("Vercel Backend Error:", error);
        return res.status(500).json({ 
            error: "HATA_OLUSTU",
            message: error.message 
        });
    }
}
