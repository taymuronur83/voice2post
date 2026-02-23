export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });

    const { script } = req.body;
    const token = process.env.GH_TOKEN; // İsimlendirme GH_TOKEN olarak güncellendi

    if (!token) return res.status(500).json({ error: "Sistemde GH_TOKEN bulunamadı!" });

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
                client_payload: { inputProps: script }
            })
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ success: true, message: "Video render işlemi başarıyla sıraya alındı!" });
        } else {
            const errLog = await response.json().catch(() => ({}));
            return res.status(400).json({ error: "GitHub API Hatası", detail: errLog });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
