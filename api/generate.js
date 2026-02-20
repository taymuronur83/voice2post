üimport Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Vercel için zaman aşımı süresini 60 saniyeye çıkarıyoruz (Geniş düşünme adımı 1)
export const config = {
    maxDuration: 60,
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;

    // API Anahtarı kontrolü
    if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ 
            linkedin: "Hata: API anahtarları Vercel panelinde eksik!", 
            twitter: "Hata: API anahtarları Vercel panelinde eksik!" 
        });
    }

    const systemPromptClaude = `Sen bir video yönetmeni ve Remotion kurgu uzmanısın. SADECE JSON döndür.
    YAPI: { "video_script": { "text": "Başlık", "theme": "ekonomi", "accentColor": "#3b82f6", "animation": { "shakeIntensity": 2, "zoomScale": 1.2, "textSpeed": 1 } } }`;

    try {
        // İki yapay zekayı paralel başlatıyoruz
        const [oaiResponse, antResponse] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Sosyal medya uzmanısın. SADECE JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
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

        // Veri Ayıklama
        let linkedinData = "İçerik üretilemedi.";
        let twitterData = "İçerik üretilemedi.";
        let videoScriptData = null;

        // OpenAI İşleme
        try {
            const oaiParsed = JSON.parse(oaiResponse.choices[0].message.content || "{}");
            linkedinData = oaiParsed.linkedin || oaiParsed.LinkedIn || oaiParsed.post || linkedinData;
            twitterData = oaiParsed.twitter || oaiParsed.Twitter || oaiParsed.x || twitterData;
        } catch (e) { console.error("OpenAI Parse Hatası"); }

        // Claude İşleme (Regex ile JSON temizleme)
        try {
            const antRaw = antResponse.content[0].text;
            const match = antRaw.match(/\{[\s\S]*\}/);
            if (match) {
                const antParsed = JSON.parse(match[0]);
                videoScriptData = antParsed.video_script || antParsed;
            }
        } catch (e) { console.error("Claude Parse Hatası"); }

        // Yedek Video Script (Arayüzün çökmesini engeller)
        if (!videoScriptData) {
            videoScriptData = { 
                text: prompt.substring(0, 30), 
                theme: "teknoloji", 
                accentColor: "#3b82f6", 
                animation: { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 } 
            };
        }

        // TAM VE ÇALIŞABİLİR YANIT
        return res.status(200).json({
            linkedin: linkedinData,
            twitter: twitterData,
            video_script: videoScriptData
        });

    } catch (error) {
        console.error("Kritik Hata:", error.message);
        return res.status(500).json({ 
            linkedin: "Sunucu hatası oluştu.", 
            twitter: "Sunucu hatası oluştu.",
            error: error.message 
        });
    }
}
