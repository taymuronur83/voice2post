export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST method required' });

    try {
        const { script } = req.body;
        
        // DİKKAT: Vercel Environment Variables kısmında ismin GH_TOKEN olduğundan emin ol
        const GITHUB_TOKEN = process.env.GH_TOKEN ? process.env.GH_TOKEN.trim() : null;

        if (!GITHUB_TOKEN) {
            return res.status(500).json({ error: "Vercel'de GH_TOKEN bulunamadı!" });
        }

        // GitHub API URL (Kullanıcı adı ve repo ismini buraya direkt gömdük)
        const url = "https://api.github.com/repos/taymuronur83/voice2post/dispatches";

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`, // 'Bearer' yerine 'token' bazen daha iyi çalışır
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function'
            },
            body: JSON.stringify({
                event_type: 'render-video', 
                client_payload: {
                    props: { text: script || "Varsayılan metin" }
                }
            })
        });

        // GitHub 204 dönerse bu başarılı demektir
        if (response.status === 204 || response.ok) {
            return res.status(200).json({ ok: true, message: "GitHub Actions tetiklendi!" });
        } else {
            const errorData = await response.text();
            console.error("GitHub Hata Kodu:", response.status);
            return res.status(response.status).json({ 
                error: "GitHub isteği reddetti", 
                code: response.status, 
                detail: errorData 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sunucu hatası", detail: err.message });
    }
}
