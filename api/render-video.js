export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST gerekli' });

    try {
        const { script } = req.body;
        const GITHUB_TOKEN = process.env.GH_TOKEN;

        // GitHub API adresi (Kullanıcı adın ve repo ismin eklendi)
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
                    props: { text: script || "Metin gelmedi" }
                }
            })
        });

        // Hata ayıklama için loglar
        console.log("GitHub Response Status:", response.status);

        if (response.status === 204 || response.ok) {
            return res.status(200).json({ ok: true, message: "Aksiyon tetiklendi!" });
        } else {
            const errorText = await response.text();
            console.error("GitHub Error Detail:", errorText);
            return res.status(response.status).json({ 
                error: "GitHub Hatası", 
                status: response.status, 
                detail: errorText 
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Sunucu hatası", message: error.message });
    }
}
