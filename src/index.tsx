import React, { useState, useEffect, useRef } from 'react';

const VideoPreviewSystem = () => {
    const [status, setStatus] = useState('idle');
    const [displayMessage, setDisplayMessage] = useState('Komut bekleniyor...');
    const [videoUrl, setVideoUrl] = useState(null);
    const videoRef = useRef(null);

    // Bellek sızıntısını önlemek için URL'i temizleme
    useEffect(() => {
        return () => {
            if (videoUrl && videoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    const sendCommandToRemote = async (command) => {
        setStatus('processing');
        setDisplayMessage('Claude kodunuzu işliyor...');
        setVideoUrl(null);

        try {
            // REMOTE İSTEK: Kendi API endpoint'ini buraya yazmalısın
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: command })
            });

            if (!response.ok) throw new Error(`Sunucu yanıt vermedi: ${response.status}`);

            // GELEN VERİ KONTROLÜ
            const contentType = response.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (data.videoUrl) {
                    setVideoUrl(data.videoUrl);
                } else {
                    throw new Error("JSON içinde videoUrl bulunamadı.");
                }
            } else {
                // Eğer sunucu direkt video dosyasını (binary) gönderiyorsa:
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setVideoUrl(objectUrl);
            }

            setStatus('success');
            setDisplayMessage('Render tamamlandı.');

        } catch (error) {
            console.error("Render Hatası Detayı:", error);
            setStatus('error');
            setDisplayMessage(`Hata: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #333', borderRadius: '5px' }}>
                <strong>Sistem Mesajı:</strong> <span style={{ color: status === 'error' ? '#ff4d4d' : '#4caf50' }}>{displayMessage}</span>
            </div>

            <div style={{ width: '100%', minHeight: '300px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {status === 'processing' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 2s linear infinite' }}></div>
                        <p>Kod İşleniyor...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {videoUrl ? (
                    <video 
                        ref={videoRef}
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        style={{ width: '100%', height: 'auto' }}
                        onError={(e) => {
                            console.error("Video Element Hatası:", e);
                            setDisplayMessage("Video oynatılamıyor: Format uyumsuz.");
                        }}
                    />
                ) : (
                    status !== 'processing' && <p style={{ color: '#666' }}>Video henüz oluşturulmadı.</p>
                )}
            </div>

            <div style={{ marginTop: '15px' }}>
                <button 
                    onClick={() => sendCommandToRemote("Render başlat")}
                    disabled={status === 'processing'}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: '#007bff',
                        color: '#white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: status === 'processing' ? 'not-allowed' : 'pointer'
                    }}
                >
                    {status === 'processing' ? 'Bekleyin...' : 'Komutu Gönder ve Render Et'}
                </button>
            </div>
        </div>
    );
};

export default VideoPreviewSystem;
