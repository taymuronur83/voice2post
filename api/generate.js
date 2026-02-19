export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API anahtarı bulunamadı.' });
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
                        {
                          "linkedin": "Profesyonel bir LinkedIn postu.",
                          "twitter": "Kısa ve etkili bir X postu.",
                          "video": "Reels/Shorts için video senaryosu."
                        }
                        SADECE JSON döndür, başka açıklama yazma.` 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;
        
        const startJson = aiResponseText.indexOf('{');
        const endJson = aiResponseText.lastIndexOf('}') + 1;
        const formattedResult = JSON.parse(aiResponseText.substring(startJson, endJson));

        return res.status(200).json(formattedResult);

    } catch (error) {
        return res.status(500).json({ error: 'AI işlenirken bir hata oluştu.' });
    }
}
