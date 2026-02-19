export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST desteklenir.' });
    }

    const { script } = req.body;
    const token = process.env.GH_TOKEN; 

    if (!token) {
        return res.status(500).json({ error: "Vercel üzerinde GH_TOKEN tanımlı değil!" });
    }

    try {
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
                    props: { text: script || "Metin yok" }
                }
            })
        });

        if (response.status === 204 || response.ok) {
            return res.status(200).json({ success: true, message: "GitHub tetiklendi." });
        } else {
            const errorData = await response.json();
            return res.status(response.status).json({ error: "GitHub Hatası", detail: errorData });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
}
