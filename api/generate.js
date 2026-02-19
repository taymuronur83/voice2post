export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    try {
        // 1. ADIM: OpenAI ile Sosyal Medya Metinlerini Üret
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Sen sosyal medya uzmanısın. Sadece şu yapıda JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const oaiData = await oaiRes.json();
        if (!oaiData.choices?.[0]) throw new Error("OpenAI tarafında bir hata oluştu veya yanıt dönmedi.");
        
        const rawOai = oaiData.choices[0].message.content;
        const oaiJson = JSON.parse(rawOai.match(/\{[\s\S]*\}/)[0]);

        // 2. ADIM: Claude ile Remotion Video Verisi Üret
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
                    content: `Remotion video bileşeni için JSON formatında sahne verileri üret. 
                    Yapı: 
                    {
                      "videoConfig": {
                        "title": "...",
                        "backgroundColor": "#000000",
                        "scenes": [
                          {"text": "Sahne 1 metni", "duration": 90},
                          {"text": "Sahne 2 metni", "duration": 90}
                        ]
                      }
                    }
                    Konu: ${prompt}. SADECE JSON DÖNDÜR.`
                }]
            })
        });

        const antData = await antRes.json();
        
        // Claude yanıt vermezse veya hata verirse yakala
        if (!antData.content?.[0]) {
            console.error("Claude Hatası:", antData);
            throw new Error("Claude API yanıt vermedi. Bakiyenizi veya API anahtarınızı kontrol edin.");
        }

        const rawAnt = antData.content[0].text;
        const antJson = JSON.parse(rawAnt.match(/\{[\s\S]*\}/)[0]);

        // 3. ADIM: Her iki veriyi birleştirip Frontend'e gönder
        return res.status(200).json({
            social: oaiJson,
            video: antJson.videoConfig
        });

    } catch (error) {
        console.error("Sistem Hatası:", error);
        return res.status(500).json({ 
            error: "İşlem sırasında bir hata oluştu.",
            details: error.message 
        });
    }
}
