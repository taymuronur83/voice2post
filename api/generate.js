export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: 'API anahtarları (OpenAI veya Claude) Vercel üzerinde eksik.' });
    }

    try {
        // --- 1. ADIM: OpenAI ile Sosyal Medya Metinlerini Oluştur ---
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Sen sosyal medya uzmanısın. Sadece şu JSON formatında yanıt ver: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                    { role: "user", content: prompt }
                ]
            })
        });
        const oaiData = await oaiRes.json();
        if (!oaiData.choices) throw new Error("OpenAI yanıt dönmedi.");
        const socialContent = JSON.parse(oaiData.choices[0].message.content);

        // --- 2. ADIM: Claude ile Video Kurgusunu Oluştur ---
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
                    content: `Aşağıdaki metinden bir video senaryosu ve Remotion verisi üret. SADECE saf JSON döndür, başka açıklama yapma: 
                    {
                      "video_script": "...",
                      "video_data": {
                        "backgroundColor": "#0f172a",
                        "scenes": [{"text": "Sahne metni", "duration": 60, "fontSize": 70}]
                      }
                    }
                    Metin: ${prompt}`
                }]
            })
        });
        const antData = await antRes.json();

        // Hata kontrolü: Claude yanıt yapısı doğrulanıyor
        if (!antData.content || !antData.content[0]) {
            throw new Error("Claude (Anthropic) servisi şu an yanıt veremiyor.");
        }

        const rawClaudeText = antData.content[0].text;
        // JSON ayıklama (metin içindeki JSON'u bulur)
        const jsonMatch = rawClaudeText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Claude geçersiz bir veri formatı döndürdü.");
        const videoContent = JSON.parse(jsonMatch[0]);

        // --- 3. ADIM: Sonuçları Birleştir ve Gönder ---
        return res.status(200).json({
            linkedin: socialContent.linkedin,
            twitter: socialContent.twitter,
            video_script: videoContent.video_script,
            video_data: videoContent.video_data
        });

    } catch (error) {
        console.error("Sistem Hatası:", error);
        return res.status(500).json({ error: error.message });
    }
}
