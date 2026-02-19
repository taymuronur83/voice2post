export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    try {
        // 1. ADIM: OpenAI - Sosyal Medya Metinleri
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Sen bir JSON makinesisin. Sadece şu yapıda JSON döndür, asla açıklama yapma: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3 
            })
        });

        const oaiData = await oaiRes.json();
        if (!oaiData.choices || !oaiData.choices[0]) throw new Error("OpenAI yanıt dönmedi.");
        
        let socialContent;
        const rawOai = oaiData.choices[0].message.content;
        try {
            // Regex ile metin içindeki JSON bloğunu ayıkla (Hatanın asıl çözümü burası)
            const jsonOaiMatch = rawOai.match(/\{[\s\S]*\}/);
            socialContent = JSON.parse(jsonOaiMatch ? jsonOaiMatch[0] : rawOai);
        } catch (e) {
            console.error("OAI JSON Parse Error:", rawOai);
            throw new Error("OpenAI formatı hatalı.");
        }

        // 2. ADIM: Claude - Video Kurgusu
        const antRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: `SADECE JSON döndür. Başka hiçbir şey yazma. Yapı: { "video_script": "...", "video_data": { "scenes": [] } } Metin: ${prompt}`
                }]
            })
        });

        const antData = await antRes.json();
        if (!antData.content || !antData.content[0]) throw new Error("Claude yanıt dönmedi.");

        let videoContent;
        const rawAnt = antData.content[0].text;
        try {
            // Claude için de aynı temizliği yapıyoruz
            const jsonAntMatch = rawAnt.match(/\{[\s\S]*\}/);
            videoContent = JSON.parse(jsonAntMatch ? jsonAntMatch[0] : rawAnt);
        } catch (e) {
            console.error("Claude JSON Parse Error:", rawAnt);
            throw new Error("Claude formatı hatalı.");
        }

        // 3. ADIM: Başarılı Yanıtı Birleştir ve Gönder
        return res.status(200).json({
            linkedin: socialContent.linkedin || "İçerik üretilemedi.",
            twitter: socialContent.twitter || "İçerik üretilemedi.",
            video_script: videoContent.video_script || "Senaryo üretilemedi.",
            video_data: videoContent.video_data || {}
        });

    } catch (error) {
        console.error("Genel Backend Hatası:", error);
        return res.status(500).json({ error: "İşlem tamamlanamadı: " + error.message });
    }
}
