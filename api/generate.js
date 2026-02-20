export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: "API anahtarları eksik! Vercel panelini kontrol et." });
    }

    const systemPromptClaude = `Sen bir video yönetmeni ve Remotion kurgu uzmanısın. 
    GÖREVİN: Kullanıcının komutunu analiz edip profesyonel bir video kurgusu JSON'ı üretmek.
    KURAL 1: SADECE JSON döndür. Markdown kullanma.
    KURAL 2: Animasyon değerlerini (shake, zoom, speed) konunun ciddiyetine göre belirle. (Örn: Putin gibi konular için shake: 5, accentColor: #ff0000)
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
        const [oaiRes, antRes] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Sen bir sosyal medya uzmanısın. SADECE JSON: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                        { role: "user", content: `Konu: ${prompt}` }
                    ],
                    response_format: { type: "json_object" }
                })
            }),
            fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 1200,
                    system: systemPromptClaude, 
                    messages: [{ role: "user", content: `Komut: ${prompt}` }]
                })
            })
        ]);

        const oaiData = await oaiRes.json();
        const antData = await antRes.json();

        const extractJSON = (text) => {
            const match = text.match(/\{[\s\S]*\}/);
            return JSON.parse(match[0]);
        };

        const finalOai = extractJSON(oaiData.choices[0].message.content);
        const finalAnt = extractJSON(antData.content[0].text);

        return res.status(200).json({
            linkedin: finalOai.linkedin,
            twitter: finalOai.twitter,
            video_script: finalAnt.video_script
        });

    } catch (error) {
        return res.status(500).json({ error: "Hata", message: error.message });
    }
}
