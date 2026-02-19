export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    try {
        // PARALEL ÇAĞRI
        const [oaiRes, antRes] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: "Sadece JSON döndür." }, { role: "user", content: prompt }]
                })
            }),
            fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1000,
                    messages: [{ role: "user", content: "Sadece JSON döndür." }]
                })
            })
        ]);

        const oaiData = await oaiRes.json();
        const antData = await antRes.json();

        // ADIM 1: OpenAI İçerik Kontrolü
        const oaiText = oaiData.choices?.[0]?.message?.content;
        if (!oaiText) throw new Error(`OpenAI boş döndü. Hata: ${JSON.stringify(oaiData.error || 'Bilinmiyor')}`);

        // ADIM 2: Claude İçerik Kontrolü
        const antText = antData.content?.[0]?.text;
        if (!antText) throw new Error(`Claude boş döndü. Hata: ${JSON.stringify(antData.error || 'Bilinmiyor')}`);

        // ADIM 3: Güvenli JSON Parse
        const extractJSON = (text) => {
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) throw new Error(`JSON bulunamadı! Ham Metin: ${text.substring(0, 100)}...`);
            return JSON.parse(match[0]);
        };

        const finalOai = extractJSON(oaiText);
        const finalAnt = extractJSON(antText);

        return res.status(200).json({ social: finalOai, video: finalAnt });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
