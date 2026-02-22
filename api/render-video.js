export default async function handler(req, res) {
    // Mevcut metod kontrolün - SİLİNMEDİ
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST desteklenir.' });
    }

    const { script } = req.body;
    const token = process.env.GH_TOKEN; 

    // Mevcut token kontrolün - SİLİNMEDİ
    if (!token) {
        return res.status(500).json({ error: "Vercel üzerinde GH_TOKEN tanımlı değil!" });
    }

    try {
        // GitHub API bağlantısı - Yapı korundu, payload genişletildi
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
                // .yml dosyasındaki tetikleyici ile tam uyum
                event_type: 'render-video', 
                client_payload: {
                    // GÜNCELLEME: Mevcut verileri korurken 'storyline' eklendi
                    props: { 
                        title: script.title || "İçerik Başlığı",
                        sub: script.sub || "Video İçeriği",
                        accentColor: script.accentColor || "#3b82f6",
                        // Yeni hikaye akışı verisi Remotion'a iletiliyor
                        storyline: script.storyline || [], 
                        animConfig: script.animation || { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 }
                    }
                }
            })
        });

        // Mevcut yanıt kontrolün - SİLİNMEDİ
        if (response.ok || response.status === 204) {
            return res.status(200).json({ 
                success: true, 
                message: "GitHub Actions tetiklendi. Video render işlemi başarıyla sıraya alındı!" 
            });
        } else {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ 
                error: "GitHub API Hatası", 
                detail: errorData 
            });
        }
    } catch (err) {
        // Mevcut hata yakalama mantığın - SİLİNMEDİ
        return res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
}
