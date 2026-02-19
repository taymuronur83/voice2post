export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const openAIKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openAIKey || !anthropicKey) {
        return res.status(500).json({ error: 'API Keys missing' });
    }

    try {
        // 1. OpenAI İsteği
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: "Metinden LinkedIn ve Twitter postu üret. SADECE şu JSON'u döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" }, { role: "user", content: prompt }]
            })
        });
        const oaiData = await oaiRes.json();
        const social = JSON.parse(oaiData.choices[0].message.content.trim());

        // 2. Claude İsteği
        const antRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'x-api-key': anthropicKey, 
                'anthropic-version': '2023-06-01' 
            },
            body: JSON.stringify({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1000,
                messages: [{ role: "user", content: `Metinden video kurgusu üret. SADECE şu formatta JSON döndür: {"video_script": "...", "video_data": {"backgroundColor": "#0f172a", "scenes": [{"text": "...", "duration": 60, "fontSize": 60}]}}. Metin: ${prompt}` }]
            })
        });
        const antData = await antRes.json();
        const video = JSON.parse(antData.content[0].text.trim());

        return res.status(200).json({
            linkedin: social.linkedin,
            twitter: social.twitter,
            video_script: video.video_script,
            video_data: video.video_data
        });

    } catch (error) {
        console.error("Hata Detayı:", error);
        return res.status(500).json({ error: error.message });
    }
}
