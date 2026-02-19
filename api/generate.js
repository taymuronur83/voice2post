export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // API Anahtarı kontrolü
    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: 'Sistem hatası: API anahtarları eksik.' });
    }

    try {
        // --- 1. ADIM: OpenAI ile Sosyal Medya Metinleri ---
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Sen bir içerik uzmanısın. Sadece şu JSON yapısını döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                    { role: "user", content: prompt }
                ]
            })
        });
        const oaiData = await oaiRes.json();
        const socialContent = JSON.parse(oaiData.choices[0].message.content);

        // --- 2. ADIM: Claude ile Video Kurgusu ---
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
                    content: `Aşağıdaki metinden video senaryosu üret. SADECE JSON döndür: 
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

        // Claude hata ve yapı kontrolü
        if (!antData.content || !antData.content[0]) {
            throw new Error("Claude yanıt dönmedi.");
        }

        const rawClaudeText = antData.content[0].text;
        // JSON'ı metin içinden temizleyerek al (Regex ile)
        const jsonMatch = rawClaudeText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Video verisi ayrıştırılamadı.");
        const videoContent = JSON.parse(jsonMatch[0]);

        // --- 3. ADIM: Birleştirilmiş Yanıt ---
        return res.status(200).json({
            linkedin: socialContent.linkedin,
            twitter: socialContent.twitter,
            video_script: videoContent.video_script,
            video_data: videoContent.video_data
        });

    } catch (error) {
        console.error("Hata Detayı:", error);
        return res.status(500).json({ error: "İşlem tamamlanamadı: " + error.message });
    }
}
