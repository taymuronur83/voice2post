export default async function handler(req, res) {
    // CORS ayarları (Vercel dışından erişim gerekirse)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST isteği kabul edilir.' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Sunucu tarafında API anahtarı (OPENAI_API_KEY) eksik.' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'İşlenecek metin boş olamaz.' });
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
                        content: `Sen uzman bir içerik üreticisisin. Sana gelen metni analiz et ve aşağıdaki JSON formatında içerik üret.
                        
                        1. linkedin: Profesyonel bir LinkedIn postu.
                        2. twitter: Kısa ve etkili bir X postu.
                        3. video: Reels/Shorts için video senaryosu.
                        
                        Yanıtını SADECE şu JSON yapısında ver:
                        {
                          "linkedin": "...",
                          "twitter": "...",
                          "video": "..."
                        }` 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("OpenAI API Hatası:", data.error);
            return res.status(500).json({ error: 'Yapay zeka servisi hata döndürdü.' });
        }

        const aiResponseText = data.choices[0].message.content;
        
        // JSON ayıklama işlemi
        try {
            const startJson = aiResponseText.indexOf('{');
            const endJson = aiResponseText.lastIndexOf('}') + 1;
            const formattedResult = JSON.parse(aiResponseText.substring(startJson, endJson));
            return res.status(200).json(formattedResult);
        } catch (e) {
            return res.status(500).json({ error: 'Yapay zeka geçersiz formatta yanıt verdi.' });
        }

    } catch (error) {
        console.error("Sunucu Hatası:", error);
        return res.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
    }
}
