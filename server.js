const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai'); // OpenAI eklendi
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// API İstemcileri
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        // PARALEL ÇALIŞMA: Hem OpenAI hem Claude aynı anda tetiklenir
        const [oaiResponse, antResponse] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Sosyal medya uzmanısın. LinkedIn ve Twitter postları üret. SADECE JSON döndür: {\"linkedin\": \"...\", \"twitter\": \"...\"}" },
                    { role: "user", content: `Konu: ${prompt}` }
                ],
                response_format: { type: "json_object" }
            }),
            anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                system: "Sen bir Remotion yönetmenisin. SADECE JSON formatında video kurgu parametreleri döndür. Markdown kullanma.",
                messages: [{
                    role: "user",
                    content: `Prompt: "${prompt}". Video kurgusu için: {"video_script": {"text": "...", "theme": "...", "accentColor": "...", "animation": {"shakeIntensity": 2, "zoomScale": 1.2}}}`
                }],
            })
        ]);

        // Verileri Ayıklama
        const oaiData = JSON.parse(oaiResponse.choices[0].message.content);
        
        // Claude yanıtını JSON olarak temizleme (Metin içindeki JSON'ı bulur)
        const antRawText = antResponse.content[0].text;
        const antData = JSON.parse(antRawText.match(/\{[\s\S]*\}/)[0]);

        // Birleştirilmiş Yanıt (Frontend'in beklediği format)
        res.json({
            linkedin: oaiData.linkedin,
            twitter: oaiData.twitter,
            video_script: antData.video_script
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            error: "İçerik üretiminde hata oluştu.",
            message: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend ${PORT} portunda aktif.`));
