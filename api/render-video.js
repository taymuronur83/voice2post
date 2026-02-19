export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { script } = req.body;
    const token = process.env.GH_TOKEN;

    // Log ekleyelim (Vercel > Logs kısmından görebiliriz)
    console.log("Tetikleme başlatıldı. Script:", script);

    try {
        const response = await fetch('https://api.github.com/repos/taymuronur83/voice2post/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-App'
            },
            body: JSON.stringify({
                event_type: 'render-video', // .yml dosyasındaki types: [render-video] ile aynı olmalı
                client_payload: {
                    props: { text: script || "Metin yok" }
                }
            })
        });

        console.log("GitHub Yanıt Durumu:", response.status);

        if (response.status === 204 || response.ok) {
            return res.status(200).json({ success: true, message: "GitHub tetiklendi!" });
        } else {
            const errorText = await response.text();
            console.error("GitHub Hata Detayı:", errorText);
            return res.status(response.status).json({ error: errorText });
        }
    } catch (error) {
        console.error("Sistem Hatası:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
