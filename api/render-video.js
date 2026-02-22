export default async function handler(req, res) {
    // Mevcut metod kontrolün
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST desteklenir.' });
    }

    const { script } = req.body;
    const token = process.env.GH_TOKEN; 

    // Token kontrolü
    if (!token) {
        return res.status(500).json({ error: "Vercel üzerinde GH_TOKEN tanımlı değil!" });
    }

    try {
        // GÜNCELLEME: Repo adresin ve Payload yapın hatasız hale getirildi
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
                // Bu isim .yml dosyasındaki types: [render-video] ile eşleşmelidir
                event_type: 'render-video', 
                client_payload: {
                    // Remotion bileşeninin (index.tsx) beklediği isimlere (title, sub) entegre edildi
                    props: { 
                        title: script.title || "İçerik Başlığı",
                        sub: script.sub || "Video İçeriği",
                        accentColor: script.accentColor || "#3b82f6",
                        animConfig: script.animation || { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 }
                    }
                }
            })
        });

        // Yanıt kontrolü (GitHub 204 No Content döndürürse başarılı sayılır)
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
        // Hata durumunda hiçbir veriyi kaybetmeden döndürür
        return res.status(500).json({ error: "Sunucu hatası: " + err.message });
    }
}
