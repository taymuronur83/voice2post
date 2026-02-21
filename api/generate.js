export default async function handler(req, res) {
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
                        content: `Sen uzman bir içerik üreticisisin. Sana gelen metni analiz et ve aşağıdaki JSON formatında 4 farklı içerik üret.

TALİMATLAR:
1. linkedin: Profesyonel ve kurumsal bir LinkedIn postu.
2. twitter: Kısa, vurucu ve zekice bir X (Twitter) postu.
3. video_script: Okunacak video senaryosunun tam metni.
4. video_scenes: Video önizlemesi için kullanılacak sahneler dizisi. 

ÖNEMLİ: "video_scenes" kısmı mutlaka şu yapıda olmalı: Her sahne bir obje olmalı, içinde "text" (maks 5 kelime) ve "color" (Hex kodu) bulunmalı. Toplam 3-5 sahne üret.

Yanıtını SADECE şu JSON formatında ver:
{
  "linkedin": "...",
  "twitter": "...",
  "video_script": "...",
  "video_scenes": [
    {"text": "Kısa Başlık", "color": "#2563eb"},
    {"text": "Ana Mesaj", "color": "#10b981"},
    {"text": "Harekete Geç", "color": "#f59e0b"}
  ]
}` 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8
            })
        });

        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;
        
        let formattedResult;
        try {
            // Metin içindeki JSON yapısını ayıklayıp parse et
            const startJson = aiResponseText.indexOf('{');
            const endJson = aiResponseText.lastIndexOf('}') + 1;
            formattedResult = JSON.parse(aiResponseText.substring(startJson, endJson));
        } catch (e) {
            console.error("Parse Hatası:", e);
            return res.status(500).json({ error: 'Yapay zeka yanıtı ayrıştırılamadı.' });
        }

        return res.status(200).json(formattedResult);

    } catch (error) {
        console.error("OpenAI Hatası:", error);
        return res.status(500).json({ error: 'Yapay zeka yanıt verirken bir hata oluştu.' });
    }
}