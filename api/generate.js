const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;

    if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: "API_KEYS_MISSING" });
    }

    const systemPromptClaude = `Sen bir video yönetmeni ve Remotion kurgu uzmanısın. SADECE JSON döndür.
    YAPI: { "video_script": { "text": "Başlık", "theme": "ekonomi", "accentColor": "#3b82f6", "animation": { "shakeIntensity": 2, "zoomScale": 1.2, "textSpeed": 1 } } }`;

    try {
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

        // VERİ AYIKLAMA (ZORLAYICI YÖNTEM)
        let linkedinData = "İçerik üretilemedi.";
        let twitterData = "İçerik üretilemedi.";
        let videoScriptData = null;

        try {
            const oaiParsed = JSON.parse(oaiResponse.choices[0].message.content);
            // Tüm ihtimalleri dene: linkedin, LinkedIn, post, vb.
            linkedinData = oaiParsed.linkedin || oaiParsed.LinkedIn || oaiParsed.post || linkedinData;
            twitterData = oaiParsed.twitter || oaiParsed.Twitter || oaiParsed.x || twitterData;
        } catch (e) { console.error("OpenAI Parse Hatası"); }

        try {
            const antRaw = antResponse.content[0].text;
            const match = antRaw.match(/\{[\s\S]*\}/);
            if (match) {
                const antParsed = JSON.parse(match[0]);
                videoScriptData = antParsed.video_script || antParsed;
            }
        } catch (e) { console.error("Claude Parse Hatası"); }

        // Eğer video script hala boşsa varsayılan bir tane oluştur (Render'ın çökmemesi için)
        if (!videoScriptData) {
            videoScriptData = { text: prompt, theme: "teknoloji", accentColor: "#3b82f6", animation: { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 } };
        }

        return res.status(200).json({
            linkedin: linkedinData,
            twitter: twitterData,
            video_script: videoScriptData
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
