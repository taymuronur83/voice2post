export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { script } = req.body;

        // --- BU KISMI KENDİ BİLGİLERİNLE DOLDUR ---
        const REPO_OWNER = "SENIN_GITHUB_KULLANICI_ADIN"; 
        const REPO_NAME = "SENIN_REMOTION_REPO_ADIN";
        // -----------------------------------------

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
                    props: { text: script }
                }
            })
        });

        // GitHub'dan gelen yanıtı kontrol et
        if (response.ok || response.status === 204) {
            return res.status(200).json({ ok: true, message: "GitHub Actions tetiklendi!" });
        } else {
            const errorDetail = await response.text();
            console.error("GitHub Hata Yanıtı:", errorDetail);
            return res.status(500).json({ error: "GitHub reddetti", detail: errorDetail });
        }

    } catch (error) {
        console.error("Vercel API Hatası:", error);
        return res.status(500).json({ error: error.message });
    }
}
