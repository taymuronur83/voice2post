export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST gerekli' });

    try {
        const { script } = req.body;
        
        // GitHub API'sine sinyal gönderiyoruz
        const response = await fetch("https://api.github.com/repos/taymuronur83/voice2post/dispatches", {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.GH_TOKEN.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-App'
            },
            body: JSON.stringify({
                event_type: 'render-video', 
                client_payload: {
                    props: { text: script || "Metin yok" }
                }
            })
        });

        if (response.status === 204 || response.ok) {
            return res.status(200).json({ ok: true });
        } else {
            const errorText = await response.text();
            return res.status(500).json({ error: "GitHub Hatası", details: errorText });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
