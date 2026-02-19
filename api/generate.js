export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // ANAHTAR KONTROLÜ
    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: "API anahtarları Vercel üzerinde eksik!" });
    }

    try {
        // Hız için iki API'yi aynı anda başlatıyoruz
        const [oaiResponse, antResponse] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: "Sadece JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" }, { role: "user", content: prompt }]
                })
            }),
            fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307", // Daha hızlı yanıt için Haiku modeli
                    max_tokens: 1000,
                    messages: [{ role: "user", content: `Remotion JSON döndür: {"videoConfig": {"title": "...", "scenes": [{"text": "...", "duration": 60}]}}. Konu: ${prompt}` }]
                })
            })
        ]);

        // Verileri çöz
        const oaiData = await oaiResponse.json();
        const antData = await antResponse.json();

        // OpenAI Hata Kontrolü
        if (oaiData.error) throw new Error(`OpenAI: ${oaiData.error.message}`);
        // Claude Hata Kontrolü
        if (antData.error) throw new Error(`Claude: ${antData.error.message}`);

        // JSON Ayıklama
        const cleanOai = JSON.parse(oaiData.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
        const cleanAnt = JSON.parse(antData.content[0].text.match(/\{[\s\S]*\}/)[0]);

        return res.status(200).json({
            social: cleanOai,
            video: cleanAnt.videoConfig
        });

    } catch (error) {
        console.error("KRİTİK HATA:", error.message);
        // Hatanın tam olarak ne olduğunu ekranda görmek için mesajı gönderiyoruz
        return res.status(500).json({ error: "Hata Detayı: " + error.message });
    }
}
