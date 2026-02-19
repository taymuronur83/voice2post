import React, { useState, useEffect } from 'react';

// Preview ve Komut İşleme Bileşeni
const VideoPreviewSystem = () => {
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [displayMessage, setDisplayMessage] = useState('Komut bekleniyor...');
    const [videoUrl, setVideoUrl] = useState(null);

    // Komutu Uzak Sunucuya/Claude API'sine Gönderen Fonksiyon
    const sendCommandToRemote = async (command) => {
        setStatus('processing');
        setDisplayMessage('Claude kodunuzu işliyor...');

        try {
            // NOT: Buradaki fetch senin gerçek endpoint'in olmalı. 
            // Eğer simülasyon yapıyorsan setTimeout ile sonucun döndüğünü teyit etmeliyiz.
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: command })
            });

            if (!response.ok) throw new Error('Bağlantı hatası: Komut iletilemedi.');

            const data = await response.json();
            
            // Veri geldiğinde "Claude bekliyor" yazısını kapatıyoruz
            setVideoUrl(data.videoUrl);
            setStatus('success');
            setDisplayMessage('Video başarıyla oluşturuldu.');

        } catch (error) {
            console.error("Hata detayı:", error);
            setStatus('error');
            setDisplayMessage('Hata: Komut gönderilemedi. Lütfen bağlantıyı kontrol edin.');
        }
    };

    return (
        <div className="preview-container" style={{ padding: '20px', background: '#1a1a1a', color: '#fff' }}>
            <div className="status-bar" style={{ marginBottom: '10px', color: status === 'error' ? 'red' : '#00ff00' }}>
                Durum: {displayMessage}
            </div>

            <div className="video-display-area" style={{ width: '100%', height: '400px', border: '2px dashed #444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {status === 'processing' ? (
                    <div className="loader">
                        {/* İşte o takılı kalan animasyon burası, ama artık dinamik */}
                        <p>Kod işleniyor, lütfen bekleyin...</p>
                        <div className="spinner"></div> 
                    </div>
                ) : videoUrl ? (
                    <video controls src={videoUrl} style={{ width: '100%' }} />
                ) : (
                    <p>Önizleme hazır değil.</p>
                )}
            </div>

            <div className="controls" style={{ marginTop: '20px' }}>
                <button 
                    onClick={() => sendCommandToRemote("Yeni video oluştur")}
                    disabled={status === 'processing'}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    Komutu Gönder (Remote)
                </button>
            </div>
        </div>
    );
};

export default VideoPreviewSystem;
