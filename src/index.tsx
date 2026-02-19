import React, { useState, useEffect, useRef } from 'react';

const VideoPreviewSystem = () => {
    // State Yönetimi
    const [status, setStatus] = useState('idle'); // idle, processing, rendering, success, error
    const [displayMessage, setDisplayMessage] = useState('Komut bekleniyor...');
    const [videoUrl, setVideoUrl] = useState(null);
    const [renderError, setRenderError] = useState(null);
    
    // Video referansı (Hataları anlık yakalamak için)
    const videoRef = useRef(null);

    // Render Hatası Yakalayıcı (Video oynatılamazsa devreye girer)
    const handleVideoError = () => {
        setRenderError("Video dosyası bozuk veya render edilemedi.");
        setStatus('error');
        setDisplayMessage("Render Hatası: Video yüklenemiyor.");
    };

    // Komutu Uzak Sunucuya Gönderen Fonksiyon
    const sendCommandToRemote = async (command) => {
        // Resetleme
        setStatus('processing');
        setDisplayMessage('Claude kodunuzu işliyor...');
        setRenderError(null);
        setVideoUrl(null);

        try {
            // REMOTE BAĞLANTI: Buradaki URL senin gerçek API adresin olmalı.
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: command,
                    timestamp: new Date().getTime() // Cache problemini önlemek için
                })
            });

            if (!response.ok) {
                throw new Error(`Sunucu Hatası: ${response.status}`);
            }

            const data = await response.json();
            
            // API'den gelen veriyi kontrol et (videoUrl boş gelirse hata ver)
            if (data && data.videoUrl) {
                setStatus('rendering');
                setDisplayMessage('Video verisi alındı, render ediliyor...');
                setVideoUrl(data.videoUrl);
            } else {
                throw new Error("Sunucudan geçerli bir video URL'si gelmedi.");
            }

        } catch (error) {
            console.error("Detaylı Hata:", error.message);
            setStatus('error');
            setDisplayMessage(`Bağlantı/Render Hatası: ${error.message}`);
        }
    };

    return (
        <div className="preview-container" style={{ padding: '20px', background: '#121212', color: '#e0e0e0', borderRadius: '8px' }}>
            <div className="status-header" style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                borderRadius: '4px',
                background: status === 'error' ? '#441111' : '#1e1e1e',
                border: `1px solid ${status === 'error' ? 'red' : '#333'}`
            }}>
                <strong>Durum:</strong> {displayMessage}
            </div>

            <div className="video-viewport" style={{ 
                width: '100%', 
                minHeight: '400px', 
                background: '#000', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #333'
            }}>
                {/* Render Süreci Görselleştirmesi */}
                {status === 'processing' && (
                    <div className="loader-box">
                        <div className="spinner"></div>
                        <p>Kod İşleniyor...</p>
                    </div>
                )}

                {status === 'rendering' && <p>Görüntü oluşturuluyor...</p>}

                {videoUrl && (
                    <video 
                        ref={videoRef}
                        controls 
                        autoPlay
                        src={videoUrl} 
                        onError={handleVideoError}
                        style={{ width: '100%', maxHeight: '100%' }}
                    />
                )}

                {status === 'error' && (
                    <div style={{ color: '#ff5555', textAlign: 'center' }}>
                        <p>⚠️ {renderError || "Bilinmeyen bir hata oluştu."}</p>
                    </div>
                )}
            </div>

            <div className="action-area" style={{ marginTop: '20px' }}>
                <button 
                    onClick={() => sendCommandToRemote("Yeni sahne render et")}
                    disabled={status === 'processing'}
                    style={{ 
                        padding: '12px 24px', 
                        backgroundColor: status === 'processing' ? '#333' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {status === 'processing' ? 'İşleniyor...' : 'Render Başlat'}
                </button>
            </div>
        </div>
    );
};

export default VideoPreviewSystem;
