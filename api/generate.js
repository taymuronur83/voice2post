export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: 'API anahtarları (OpenAI veya Claude) eksik.' });
    }

    try {
        // 1. ADIM: OpenAI ile Sosyal Medya Metinlerini Oluştur
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Sen sosyal medya uzmanısın. Metinden birer LinkedIn ve Twitter postu üret. Yanıtı JSON formatında ver: { 'linkedin': '...', 'twitter': '...' }" },
                    { role: "user", content: prompt }
                ]
            })
        });
        const openAIData = await openAIResponse.json();
        const socialContent = JSON.parse(openAIData.choices[0].message.content);

        // 2. ADIM: Claude ile Video Kurgusunu Oluştur (Remotion Verisi)
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
                    content: `Aşağıdaki metinden bir video senaryosu ve Remotion verisi üret. 
                    {
                      "video_script": "...",
                      "video_data": {
                        "backgroundColor": "#0f172a",
                        "scenes": [{"text": "Sahne Metni", "duration": 60, "fontSize": 70}]
                      }
                    }
                    Metin: ${prompt}`
                }]
            })
        });
        const anthropicData = await anthropicResponse.json();
        const videoContent = JSON.parse(anthropicData.content[0].text);

        // 3. ADIM: Tüm Bilgileri Birleştir ve Gönder
        return res.status(200).json({
            linkedin: socialContent.linkedin,
            twitter: socialContent.twitter,
            video_script: videoContent.video_script,
            video_data: videoContent.video_data // Claude'un Remotion verisi
        });

    } catch (error) {
        console.error("Sistem Hatası:", error);
        return res.status(500).json({ error: 'İçerik üretilirken bir hata oluştu.' });
    }
}
