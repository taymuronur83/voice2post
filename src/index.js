import { useState, useEffect } from 'react';

export default function Home() {
  const [command, setCommand] = useState('');
  const [videoUrl, setVideoUrl] = useState(null); // Videonun linki
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // SİSTEMİN ÇALIŞMASI İÇİN ANA FONKSİYON
  const generateVideo = async () => {
    if (!command) return alert("Lütfen bir komut girin!");
    
    setLoading(true);
    setStatus('Yapay zeka içeriği hazırlıyor ve video motoru tetikleniyor...');
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus('İşlem başlatıldı! Video render ediliyor (1-2 dakika sürebilir)...');
        // NOT: Video GitHub'da render edildiği için anında gelmez. 
        // Burada video bittiğinde videoUrl'i set edecek bir mekanizma (webhook) gereklidir.
      } else {
        setStatus('Hata: ' + data.error);
      }
    } catch (err) {
      setStatus('Bağlantı hatası oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto',
      textAlign: 'center' 
    }}>
      <h1 style={{ color: '#333' }}>AI Video Creator</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <textarea 
          value={command} 
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Örn: 10 saniyelik bir motivasyon videosu hazırla..."
          style={{ 
            width: '100%', 
            height: '120px', 
            padding: '15px', 
            borderRadius: '10px', 
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
      </div>

      <button 
        onClick={generateVideo}
        disabled={loading}
        style={{ 
          padding: '15px 40px', 
          fontSize: '18px', 
          backgroundColor: loading ? '#ccc' : '#0070f3', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'HAZIRLANIYOR...' : 'VİDEOYU OLUŞTUR'}
      </button>

      <p style={{ marginTop: '20px', color: '#666' }}>{status}</p>

      {/* --- KRİTİK KISIM: VİDEO OVERLAY (EN ÖNDE GÖZÜKEN PANEL) --- */}
      {videoUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)', // Ekranı tamamen karartır
          zIndex: 999999, // HER ŞEYİN AMA HER ŞEYİN ÖNÜNDE
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>Videonuz Hazır!</h2>
            
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              style={{ 
                width: '100%', 
                borderRadius: '15px', 
                boxShadow: '0 0 30px rgba(255,255,255,0.3)',
                border: '2px solid #fff' 
              }} 
            />

            <button 
              onClick={() => setVideoUrl(null)}
              style={{
                marginTop: '30px',
                padding: '12px 50px',
                backgroundColor: '#ff4d4d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              PANELİ KAPAT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
