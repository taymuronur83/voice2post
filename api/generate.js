export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: "API anahtarları eksik! Vercel panelini kontrol et." });
    }

    try {
        // PARALEL ÇAĞRI: Hem OpenAI hem Claude aynı anda çalışır.
        const [oaiRes, antRes] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Sen bir sosyal medya uzmanısın. SADECE JSON döndür. Yapı: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                        { role: "user", content: `Şu konu hakkında LinkedIn ve Twitter postu yaz: ${prompt}` }
                    ],
                    temperature: 0.7
                })
            }),
            fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-api-key': anthropicKey, 
                    'anthropic-version': '2023-06-01' 
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1200,
                    messages: [{ 
                        role: "user", 
                        content: `Sen bir Remotion kurgu uzmanısın. Metni analiz et ve teknik video verisi üret. SADECE JSON döndür. Markdown etiketi ( \`\`\`json ) kullanma.
                        
                        Yapı tam olarak şöyle olmalı (Remotion videoPlan formatı): 
                        {
                          "video_script": {
                            "text": "Videoda görünecek ana başlık/metin",
                            "theme": "ekonomi veya motive veya teknoloji",
                            "accentColor": "#hex_kodu",
                            "backgroundUrl": "konuyla ilgili kaliteli bir unsplash görsel linki",
                            "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                          }
                        }
                        
                        Konu: ${prompt}` 
                    }]
                })
            })
        ]);

        const oaiData = await oaiRes.json();
        const antData = await antRes.json();

        // 1. OpenAI Yanıt Kontrolü
        const oaiText = oaiData.choices?.[0]?.message?.content;
        if (!oaiText) throw new Error("OpenAI yanıtı boş.");

        // 2. Claude Yanıt Kontrolü
        const antText = antData.content?.[0]?.text;
        if (!antText) throw new Error("Claude yanıtı boş.");

        // Güvenli JSON Ayıklama Fonksiyonu (Hem OpenAI hem Claude için ortak)
        const extractJSON = (text) => {
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("AI geçerli bir JSON bloğu oluşturamadı.");
            return JSON.parse(match[0]);
        };

        const finalOai = extractJSON(oaiText);
        const finalAnt = extractJSON(antText);

        // FRONTEND'E GİDEN VERİ: 
        // HTML'deki iframe URL'sinin doğru çalışması için video_script objesi tam halde gönderiliyor.
        return res.status(200).json({
            linkedin: finalOai.linkedin || "Metin üretilemedi",
            twitter: finalOai.twitter || "Metin üretilemedi",
            // Remotion bileşeninin direkt okuduğu obje yapısı:
            video_script: finalAnt.video_script || {
                text: "Video Hazırlanıyor...",
                theme: "teknoloji",
                accentColor: "#00d4ff",
                backgroundUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
            }
        });

    } catch (error) {
        console.error("Hata Detayı:", error);
        return res.status(500).json({ error: "Yapay zeka yanıtı işlenemedi: " + error.message });
    }
}
