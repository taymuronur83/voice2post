export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: "API anahtarları eksik! Vercel panelini kontrol et." });
    }

    // GÜÇLENDİRİLMİŞ SİSTEM TALİMATI
    const systemPromptClaude = `Sen bir içerik üretim robotusun ve Remotion kurgu uzmanısın. 
    GÖREVİN: Kullanıcı mesajını analiz et ve SADECE JSON formatında yanıt dön. 
    KURAL 1: Yanıtına asla "İşte analizim", "Hazırlıyorum" gibi cümleler veya açıklama ekleme.
    KURAL 2: Sadece saf JSON dön, markdown (\`\`\`json) kullanma.
    KURAL 3: Yapı tam olarak şöyle olmalı:
    {
      "video_script": {
        "text": "Videoda görünecek ana başlık/metin",
        "theme": "ekonomi veya motive veya teknoloji",
        "accentColor": "#hex_kodu",
        "backgroundUrl": "https://images.unsplash.com/photo-X (konuyla ilgili kaliteli bir görsel)",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      }
    }`;

    try {
        // PARALEL ÇAĞRI: Modeller yükseltildi (GPT-4o-mini ve Claude 3.5 Sonnet)
        const [oaiRes, antRes] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // Daha zeki ve JSON uyumlu
                    messages: [
                        { role: "system", content: "Sen bir sosyal medya uzmanısın. SADECE JSON döndür. Asla açıklama yapma. Yapı: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                        { role: "user", content: `Şu konu hakkında LinkedIn ve Twitter postu yaz: ${prompt}` }
                    ],
                    response_format: { type: "json_object" }, // OpenAI için JSON zorlaması
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
                    model: "claude-3-5-sonnet-20240620", // EN KAPSAMLI VERSİYON
                    max_tokens: 1200,
                    system: systemPromptClaude, // Sistem talimatı buraya alındı
                    messages: [{ 
                        role: "user", 
                        content: `Konu: ${prompt}` 
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

        // GÜVENLİ JSON AYIKLAMA (Zırhlı Versiyon)
        const extractJSON = (text) => {
            try {
                const match = text.match(/\{[\s\S]*\}/);
                if (!match) throw new Error("JSON bloğu bulunamadı.");
                return JSON.parse(match[0]);
            } catch (e) {
                console.error("Parse hatası metni:", text);
                throw new Error("AI geçerli bir JSON oluşturamadı.");
            }
        };

        const finalOai = extractJSON(oaiText);
        const finalAnt = extractJSON(antText);

        // FRONTEND'E GİDEN VERİ
        return res.status(200).json({
            linkedin: finalOai.linkedin || "LinkedIn metni hazırlanamadı.",
            twitter: finalOai.twitter || "Twitter metni hazırlanamadı.",
            video_script: finalAnt.video_script || {
                text: "Video Planı Oluşturulamadı",
                theme: "teknoloji",
                accentColor: "#3b82f6",
                backgroundUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            }
        });

    } catch (error) {
        console.error("Hata Detayı:", error);
        return res.status(500).json({ 
            error: "Sistem hatası", 
            message: error.message,
            // Hata anında bile frontend'in çökmemesi için fallback verisi
            video_script: { text: "Bir hata oluştu, lütfen tekrar deneyin." }
        });
    }
}
