export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Lütfen POST metodu kullanın.' });
    }

    const { script } = req.body;
    const token = process.env.GH_TOKEN; 

    if (!token) {
        return res.status(500).json({ error: "GH_TOKEN Vercel üzerinde tanımlı değil!" });
    }

    try {
        // Kullanıcı adın: taymuronur83, Repo adın: voice2post
        const response = await fetch('https://api.github.com/repos/taymuronur83/voice2post/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Voice2Post-App'
            },
            body: JSON.stringify({
                event_type: 'render-video', 
                client_payload: {
                    props: { text: script || "İçerik boş gönderildi." }
                }
            })
        });

        if (response.status === 204 || response.ok) {
            return res.status(200).json({ success: true, message: "GitHub Actions tetiklendi (204 No Content)." });
        } else {
            const errorText = await response.text();
            return res.status(response.status).json({ 
                error: "GitHub API Hatası", 
                detail: errorText,
                repo: "taymuronur83/voice2post"
            });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
}
