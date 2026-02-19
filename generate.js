export default async function handler(req, res) {
    // CORS ayarları: Tarayıcıdan gelen isteklere izin ver
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnızca POST istekleri kabul edilir.' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Sistem Hatası: OpenAI API anahtarı Vercel üzerinde tanımlanmamış.' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: `Sen profesyonel bir içerik üreticisisin. Sana gelen metni analiz et ve SADECE aşağıdaki JSON formatında yanıt ver. Başka açıklama ekleme.
                        {
                          "linkedin": "Profesyonel LinkedIn postu...",
                          "twitter": "Vurucu X postu...",
                          "video": "Kısa video/reels senaryosu..."
                        }` 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ error: 'OpenAI Hatası: ' + data.error.message });
        }

        const aiContent = data.choices[0].message.content;
        
        // JSON metnini temizle ve objeye dönüştür
        try {
            const cleanJson = aiContent.substring(aiContent.indexOf('{'), aiContent.lastIndexOf('}') + 1);
            const result = JSON.parse(cleanJson);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ error: 'AI geçersiz bir format döndürdü.' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
}
