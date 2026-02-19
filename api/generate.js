export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

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
                        content: `Sen bir video yönetmenisin. Gelen metni analiz et ve şu JSON formatında yanıt ver:
                        {
                          "linkedin": "...",
                          "twitter": "...",
                          "video_script": "...",
                          "remotion_data": {
                             "title": "Videonun Ana Başlığı",
                             "scenes": [
                               {"text": "Sahne 1 Metni", "color": "#2563eb", "duration": 60},
                               {"text": "Sahne 2 Metni", "color": "#10b981", "duration": 60}
                             ]
                          }
                        }` 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Video verisi oluşturulamadı.' });
    }
}
