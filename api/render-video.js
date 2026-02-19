export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { script } = req.body;

        // BİLGİLERİNİ BURADAN KONTROL ET
        const REPO_OWNER = "taymuronur83"; 
        const REPO_NAME = "voice2post";

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

        if (response.ok || response.status === 204) {
            return res.status(200).json({ ok: true });
        } else {
            const errorText = await response.text();
            return res.status(500).json({ error: "GitHub Hatası", detail: errorText });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
