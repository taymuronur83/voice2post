export default async function handler(req, res) {
    // Vercel'in CORS ve Metot kontrolü
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metot bulunamadı, lütfen POST kullanın.' });
    }

    const { script } = req.body;
    // Vercel Dashboard'a eklediğin isimle birebir aynı olmalı
    const token = process.env.GH_TOKEN; 

    if (!token) {
        return res.status(500).json({ error: "Vercel üzerinde GH_TOKEN tanımlı değil!" });
    }

    try {
        const response = await fetch('https://api.github.com/repos/taymuronur83/voice2post/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Voice2Post-App'
            },
            body: JSON.stringify({
                event_type: 'render-video', // .yml dosyasındaki types ile aynı olmalı
                client_payload: {
                    props: { text: script || "Varsayılan Metin" }
                }
            })
        });

        if (response.status === 204 || response.ok) {
            return res.status(200).json({ success: true, message: "GitHub Action başarıyla tetiklendi!" });
        } else {
            const errorText = await response.text();
            return res.status(response.status).json({ error: "GitHub Hatası", details: errorText });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sunucu içi hata: " + err.message });
    }
}
