export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { script } = req.body;

        // Senin güncel bilgilerin
        const REPO_OWNER = "taymuronur83"; 
        const REPO_NAME = "voice2post";

        // GitHub API'sine komut gönder
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'render-video', 
                client_payload: {
                    props: { text: script || "Metin gelmedi" }
                }
            })
        });

        // GitHub yanıtını kontrol et
        if (response.ok || response.status === 204) {
            return res.status(200).json({ ok: true, message: "GitHub Actions başarıyla tetiklendi!" });
        } else {
            const errorDetail = await response.text();
            return res.status(500).json({ 
                error: "GitHub isteği reddetti", 
                detail: errorDetail,
                owner: REPO_OWNER,
                repo: REPO_NAME
            });
        }

    } catch (error) {
        return res.status(500).json({ error: "Sunucu Hatası", message: error.message });
    }
}
