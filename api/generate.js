// generate.js - MEVCUT KODLARINI KORUR, ÜZERİNE EKLEME YAPAR

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        // 1. ADIM: CLAUDE ENTEGRASYONU (AI ÇALIŞTIRMA)
        // Burada senin mevcut Claude API çağrın olduğunu varsayıyoruz.
        // AI'dan video için gerekli metinleri/parametreleri alıyoruz.
        const aiResponse = await callClaudeAPI(prompt); 

        if (!aiResponse) {
            throw new Error("Yapay zeka içeriği oluşturamadı.");
        }

        // 2. ADIM: REMOTION RENDER İŞLEMİ
        // Claude'dan gelen veriyi Remotion'a gönderip videoya dönüştürüyoruz.
        // 'SocialMediaVideo' senin Remotion projesindeki Composition ID'n olmalı.
        
        console.log("Video render işlemi başlatılıyor...");
        
        const renderResult = await fetch(`${process.env.REMOTION_SERVER_URL}/api/render`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                composition: "SocialMediaVideo", 
                inputProps: {
                    text: aiResponse.text,       // AI'dan gelen yazı
                    audioUrl: aiResponse.audio, // AI'dan gelen ses (varsa)
                    theme: aiResponse.theme     // AI'dan gelen tema ayarı
                }
            }),
        });

        const videoData = await renderResult.json();

        // 3. ADIM: SONUCU FRONTEND'E (SİTEYE) GÖNDERME
        // Video render edildikten sonra URL'i direkt siteye basıyoruz.
        
        if (videoData.url) {
            // SİSTEMİN ÇALIŞMASI İÇİN BU RETURN ŞART:
            return res.status(200).json({
                success: true,
                url: videoData.url, // Bu URL videonun internetteki adresidir
                message: "Video başarıyla oluşturuldu ve yüklendi."
            });
        } else {
            throw new Error("Remotion video URL'i oluşturamadı.");
        }

    } catch (error) {
        console.error("Generate.js Hatası:", error);
        return res.status(500).json({
            success: false,
            error: "Yapay zeka veya Video motoru şu an çalışmıyor: " + error.message
        });
    }
}

// YARDIMCI FONKSİYON (EĞER SENDE YOKSA DİYE TASLAK OLARAK EKLENDİ)
async function callClaudeAPI(userPrompt) {
    // Buraya senin mevcut Claude API anahtarın ve fetch kodun gelecek.
    // Önemli olan return edilen objenin Remotion'a gitmesidir.
    return {
        text: "AI tarafından üretilen sosyal medya içeriği",
        theme: "dark"
    };
}
