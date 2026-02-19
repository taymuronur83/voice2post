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
        "backgroundUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&q=80",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      }
    }`;

    try {
        // PARALEL ÇAĞRI: Modeller yükseltildi ve Tier 1 için optimize edildi
        const [oaiRes, antRes] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Sen bir sosyal medya uzmanısın. SADECE JSON döndür. Asla açıklama yapma. Yapı: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                        { role: "user", content: `Şu konu hakkında LinkedIn ve Twitter postu yaz: ${prompt}` }
                    ],
                    response_format: { type: "json_object" },
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
                    model: "claude-3-5-sonnet-20240620", // Tier 1'in gücünü kullanıyoruz
                    max_tokens: 1200,
                    system: systemPromptClaude, 
                    messages: [{ 
                        role: "user", 
                        content: `Konu: ${prompt}` 
                    }]
                })
            })
        ]);

        const oaiData = await oaiRes.json();
        const antData = await antRes.json();

        // Yanıtların teknik kontrolü
        if (oaiData.error) throw new Error(`OpenAI Hatası: ${oaiData.error.message}`);
        if (antData.error) throw new Error(`Claude Hatası: ${antData.error.message}`);

        const oaiText = oaiData.choices?.[0]?.message?.content;
        const antText = antData.content?.[0]?.text;

        if (!oaiText || !antText) throw new Error("AI yanıtlarından biri boş geldi.");

        // GÜVENLİ JSON AYIKLAMA (Regex ile dış metinleri temizler)
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
                text: "Video kurgulanırken bir sorun oluştu.",
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
            video_script: { text: "Hata: " + error.message }
        });
    }
}
