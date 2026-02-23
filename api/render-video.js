export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });

    const { script } = req.body;
    const token = process.env.GITHUB_TOKEN; 

    try {
        const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
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
            return res.status(200).json({ success: true, message: "Video render işlemi GitHub Actions üzerinde başlatıldı!" });
        } else {
            return res.status(400).json({ error: "GitHub API hatası" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
