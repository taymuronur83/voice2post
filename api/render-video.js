export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

    try {
        const { script } = req.body;
        const GITHUB_TOKEN = process.env.GH_TOKEN;

        // URL'nin doğruluğunu buradan kontrol et: taymuronur83 / voice2post
        const url = "https://api.github.com/repos/taymuronur83/voice2post/dispatches";

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN.trim()}`,
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
            return res.status(200).json({ ok: true, message: "Aksiyon tetiklendi!" });
        } else {
            const errorText = await response.text();
            return res.status(response.status).json({ error: "GitHub Hatası", status: response.status, detail: errorText });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
