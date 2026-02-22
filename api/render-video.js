export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST desteklenir.' });
    }

    const { script } = req.body;
    const token = process.env.GH_TOKEN; 

    if (!token) {
        return res.status(500).json({ error: "GH_TOKEN bulunamadı! Vercel'e eklediğinden emin ol." });
    }

    try {
        const response = await fetch('https://api.github.com/repos/taymuronur83/voice2post/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Voice2Post-App'
            },
            body: JSON.stringify({
                // DİKKAT: Bu isim .yml dosyasındaki types: [render-video] ile BİREBİR aynı olmalı
                event_type: 'render-video', 
                client_payload: {
                    props: { 
                        title: script.title || "Hazır",
                        sub: script.sub || "İÇERİK OLUŞTURULUYOR",
                        accentColor: script.accentColor || "#3b82f6",
                        animConfig: script.animation || { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 }
                    }
                }
            })
        });

        // GitHub 204 dönerse tetikleme başarılıdır
        if (response.status === 204 || response.ok) {
            return res.status(200).json({ success: true, message: "Workflow başarıyla tetiklendi! GitHub Actions sekmesini kontrol et." });
        } else {
            const errorText = await response.text();
            return res.status(response.status).json({ error: "GitHub Hatası", detail: errorText });
        }
    } catch (err) {
        return res.status(500).json({ error: "Sistem Hatası: " + err.message });
    }
}
