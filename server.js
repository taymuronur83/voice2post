const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Vercel'deki görseline göre key ismini güncelledim
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY, 
});

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Prompt: "${prompt}". Bu metinden profesyonel bir LinkedIn postu, bir X postu ve dikey video senaryosu üret. Yanıtı sadece şu JSON formatında ver: {"linkedin": "...", "twitter": "...", "video_script": {"text": "...", "bg": "#0f172a"}}`
            }],
        });
        
        // Claude bazen metin başına açıklama ekleyebilir, bu yüzden parse ederken dikkatli oluyoruz
        const content = JSON.parse(msg.content[0].text);
        res.json(content);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "İçerik üretiminde hata oluştu." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend ${PORT} portunda aktif.`));
