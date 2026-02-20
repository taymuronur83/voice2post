export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST desteklenir.' });
    }

    // Frontend'den gelen 'script' artık tüm video_script objesini içermeli
    const { script } = req.body;
    const token = process.env.GH_TOKEN; 

    if (!token) {
        return res.status(500).json({ error: "Vercel üzerinde GH_TOKEN tanımlı değil!" });
    }

    try {
        // GitHub Actions Dispatcher
        const response = await fetch('https://api.github.com/repos/taymuronur83/voice2post/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Voice2Post-App'
            },
            body: JSON.stringify({
                event_type: 'render-video',
                client_payload: {
                    // CLAUDE SONNET VERİLERİNİ TAM PAKET OLARAK GÖNDERİYORUZ
                    props: { 
                        text: script.text || "Metin yok",
                        backgroundUrl: script.backgroundUrl,
                        accentColor: script.accentColor,
                        audioUrl: script.audioUrl,
                        animation: script.animation // Sarsıntı ve Zoom kodları buraya gidiyor
                    }
                }
            })
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ success: true, message: "GitHub Actions tetiklendi. Video render işlemi başlıyor." });
        } else {
            const errorData = await response.json();
            return res.status(response.status).json({ error: "GitHub Hatası", detail: errorData });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
}
