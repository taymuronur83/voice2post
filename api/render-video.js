export default async function handler(req, res) {
    const { script } = req.body;
    // BURAYI KENDİ BİLGİLERİNLE DOLDUR
    const REPO_OWNER = "GitHub_Kullanıcı_Adın"; 
    const REPO_NAME = "GitHub_Repo_Adın";

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GH_TOKEN}`, // Vercel'e eklediğin gizli şifre
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

    if (response.ok) res.status(200).json({ ok: true });
    else res.status(500).json({ error: "GitHub tetiklenemedi" });
}
