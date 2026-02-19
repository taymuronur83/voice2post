export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Sadece POST');

    const { script } = req.body;
    
    // !!! BURALARI KENDİ BİLGİLERİNLE GÜNCELLE !!!
    const REPO_OWNER = "GitHub_Kullanıcı_Adın"; 
    const REPO_NAME = "Proje_Depo_Adın";

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'render-video', // GitHub YAML dosyasındaki 'types' ile aynı olmalı
                client_payload: {
                    props: { text: script }
                }
            })
        });

        if (response.ok) {
            res.status(200).json({ ok: true });
        } else {
            const errorData = await response.text();
            res.status(500).json({ error: errorData });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
