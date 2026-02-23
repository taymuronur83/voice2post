import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);

  const startProcess = async () => {
    if (!prompt) return alert("Komut girin!");
    setStatus('Yapay zeka üretiliyor...');
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus('İçerik hazır! Video render ediliyor (1-2 dk sürebilir)...');
        // Buradan sonra video linkini almak için ya sayfayı yenilemelisin 
        // ya da GitHub'ın videoyu bitirip sitene URL yollaması lazım.
      } else {
        setStatus('Hata: ' + data.error);
      }
    } catch (err) {
      setStatus('Bağlantı hatası.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Sosyal Medya Video Üretici</h1>
      <textarea 
        style={{ width: '100%', height: '100px', padding: '10px' }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Video ne hakkında olsun?"
      />
      <button 
        onClick={startProcess}
        style={{ width: '100%', padding: '15px', marginTop: '10px', backgroundColor: 'black', color: 'white', cursor: 'pointer' }}
      >
        VİDEOYU OLUŞTUR VE RENDER ET
      </button>
      
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>

      {/* VİDEO PANELİ (SADECE URL VARSA GÖZÜKÜR) */}
      {videoUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 999999,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <video src={videoUrl} controls autoPlay style={{ width: '80%', borderRadius: '10px' }} />
          <button onClick={() => setVideoUrl(null)} style={{ marginTop: '20px', padding: '10px 20px' }}>Kapat</button>
        </div>
      )}
    </div>
  );
}
