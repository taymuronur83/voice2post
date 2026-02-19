export default async function handler(req, res) {
    // CORS ayarları (Frontend'den erişim için)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    
    // API KEY KONTROLÜ
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "Backend Hatası: OPENAI_API_KEY bulunamadı!" });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Sadece JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\", \"video_script\": \"...\"}" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();
        
        // OpenAI hata döndürdüyse (Kota dolması, yanlış key vb.)
        if (data.error) {
            console.error("OpenAI Error:", data.error);
            return res.status(500).json({ error: `OpenAI Hatası: ${data.error.message}` });
        }

        const rawContent = data.choices[0].message.content;
        
        // JSON Temizleme Operasyonu (En sağlam yöntem)
        let parsedData;
        try {
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
        } catch (parseError) {
            console.error("Parse Error. Gelen Metin:", rawContent);
            return res.status(500).json({ error: "AI formatı bozuk geldi, lütfen tekrar deneyin." });
        }

        return res.status(200).json({
            linkedin: parsedData.linkedin || "İçerik yok",
            twitter: parsedData.twitter || "İçerik yok",
            video_script: parsedData.video_script || "Senaryo yok"
        });

    } catch (error) {
        console.error("Genel Hata:", error);
        return res.status(500).json({ error: "Sunucu hatası: " + error.message });
    }
}
