export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // API Anahtarı Kontrolü
    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: "API anahtarları eksik! Vercel panelini kontrol et." });
    }

    // CLAUDE İÇİN GÜÇLENDİRİLMİŞ VİDEO KURGU TALİMATI
    const systemPromptClaude = `Sen bir video yönetmeni ve Remotion kurgu uzmanısın. 
    GÖREVİN: Kullanıcının sesli/yazılı komutunu analiz edip Instagram/TikTok/Reels formatına uygun bir video kurgusu JSON'ı üretmek.
    KURAL 1: SADECE JSON döndür. Açıklama ekleme. Markdown (\`\`\`json) kullanma.
    KURAL 2: Görsel ve renk seçimlerini konuya göre yap.
    YAPI:
    {
      "video_script": {
        "text": "Videoda görünecek vurucu ana başlık",
        "theme": "ekonomi veya motive veya teknoloji",
        "accentColor": "#hex_kodu",
        "backgroundUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&q=80",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      }
    }`;

    try {
        // PARALEL ÇAĞRI: OpenAI (Sosyal Medya) & Claude (Video)
        const [oaiRes, antRes] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Sen bir sosyal medya uzmanısın. Kullanıcı komutunu LinkedIn ve Twitter formatına çevir. SADECE JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                        { role: "user", content: `Konu: ${prompt}` }
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
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 1200,
                    system: systemPromptClaude, 
                    messages: [{ 
                        role: "user", 
                        content: `Şu komut için video kurgusu yap: ${prompt}` 
                    }]
                })
            })
        ]);

        const oaiData = await oaiRes.json();
        const antData = await antRes.json();

        // Teknik Hata Kontrolleri
        if (oaiData.error) throw new Error(`OpenAI Hatası: ${oaiData.error.message}`);
        if (antData.error) throw new Error(`Claude Hatası: ${antData.error.message}`);

        const oaiText = oaiData.choices?.[0]?.message?.content;
        const antText = antData.content?.[0]?.text;

        if (!oaiText || !antText) throw new Error("AI yanıtlarından biri boş geldi.");

        // GÜVENLİ JSON AYIKLAMA (Helper Function)
        const extractJSON = (text) => {
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("JSON formatı bozuk.");
            return JSON.parse(match[0]);
        };

        const finalOai = extractJSON(oaiText);
        const finalAnt = extractJSON(antText);

        // FRONTEND'E GİDEN BİRLEŞTİRİLMİŞ VERİ
        return res.status(200).json({
            linkedin: finalOai.linkedin || "LinkedIn metni hazırlanamadı.",
            twitter: finalOai.twitter || "Twitter metni hazırlanamadı.",
            video_script: finalAnt.video_script || {
                text: "Video içeriği oluşturulamadı.",
                theme: "teknoloji",
                accentColor: "#3b82f6",
                backgroundUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            }
        });

    } catch (error) {
        console.error("Kritik Hata:", error);
        return res.status(500).json({ 
            error: "İşlem başarısız", 
            message: error.message,
            video_script: { text: "Hata: " + error.message, theme: "teknoloji", accentColor: "#ef4444" }
        });
    }
}
