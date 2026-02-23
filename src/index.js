import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState('');

  const handleStart = async () => {
    setStatus('Yapay zeka çalışıyor, lütfen bekleyin...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('İçerik hazır! Video render ediliyor. Tamamlandığında burada belirecek.');
      }
    } catch (err) {
      setStatus('Hata oluştu.');
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>AI Video Generator</h1>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Video komutunu buraya yaz..."
        style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '8px' }}
      />
      <button 
        onClick={handleStart}
        style={{ marginTop: '20px', padding: '15px 40px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        VİDEO OLUŞTUR
      </button>
      <p>{status}</p>

      {/* VİDEO EKRANI (OVERLAY) */}
      {videoUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 999999,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <video src={videoUrl} controls autoPlay style={{ width: '80%', maxWidth: '500px', borderRadius: '15px' }} />
          <button 
            onClick={() => setVideoUrl(null)}
            style={{ marginTop: '20px', background: 'red', color: 'white', padding: '10px 30px', border: 'none', cursor: 'pointer' }}
          >
            PANELİ KAPAT
          </button>
        </div>
      )}
    </div>
  );
}
