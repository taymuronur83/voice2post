export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });

    const { script } = req.body;
    const token = process.env.GH_TOKEN; // Vercel'deki ismin GH_TOKEN olduğu doğrulandı

    if (!token) return res.status(500).json({ error: "GH_TOKEN tanımlı değil!" });

    try {
        const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Voice2Post-App'
            },
            body: JSON.stringify({
                event_type: 'render-video', 
                client_payload: {
                    inputProps: script // Remotion'ın beklediği anahtar kelime
                }
            })
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ success: true, message: "GitHub Actions tetiklendi. Video sıraya alındı!" });
        } else {
            const errorDetail = await response.json().catch(() => ({}));
            return res.status(400).json({ error: "GitHub API Hatası", detail: errorDetail });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
}
