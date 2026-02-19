üexport default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // ANAHTAR KONTROLÜ: Eğer anahtarlar boşsa direkt hata döndür
    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: "API Anahtarları (Environment Variables) eksik!" });
    }

    try {
        // OpenAI Çağrısı
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Sadece JSON döndür: {"linkedin": "...", "twitter": "..."}. Metin: ${prompt}` }]
            })
        });

        const oaiData = await oaiRes.json();
        
        // OpenAI hata döndürdüyse yakala
        if (oaiData.error) throw new Error(`OpenAI Hatası: ${oaiData.error.message}`);

        let socialContent;
        const rawOai = oaiData.choices[0].message.content;
        
        // JSON Temizleme
        const jsonMatch = rawOai.match(/\{[\s\S]*\}/);
        socialContent = JSON.parse(jsonMatch ? jsonMatch[0] : rawOai);

        // Claude (Anthropic) Çağrısı
        const antRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307", // Daha hızlı ve ucuz model
                max_tokens: 1000,
                messages: [{ role: "user", content: `Sadece JSON: {"video_script": "..."}. Metin: ${prompt}` }]
            })
        });

        const antData = await antRes.json();
        
        if (antData.error) throw new Error(`Claude Hatası: ${antData.error.message}`);

        let videoContent;
        const rawAnt = antData.content[0].text;
        const jsonAntMatch = rawAnt.match(/\{[\s\S]*\}/);
        videoContent = JSON.parse(jsonAntMatch ? jsonAntMatch[0] : rawAnt);

        return res.status(200).json({
            linkedin: socialContent.linkedin || "Hata",
            twitter: socialContent.twitter || "Hata",
            video_script: videoContent.video_script || "Hata"
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
