import React, { useState, useEffect, useRef } from 'react';
import { registerRoot, Composition } from 'remotion';

// 1. Remotion'ın render edeceği asıl video içeriği
const MyVideoContent = () => {
    return (
        <div style={{ 
            flex: 1, 
            backgroundColor: '#000', 
            color: '#fff', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            fontSize: '60px',
            fontFamily: 'sans-serif'
        }}>
            Render İşlemi Başladı
        </div>
    );
};

// 2. Senin Video Önizleme ve Kontrol Sistemin
const VideoPreviewSystem = () => {
    const [status, setStatus] = useState('idle');
    const [displayMessage, setDisplayMessage] = useState('Komut bekleniyor...');
    const [videoUrl, setVideoUrl] = useState(null);
    const videoRef = useRef(null);

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
        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: command })
            });
            if (!response.ok) throw new Error(`Sunucu yanıt vermedi: ${response.status}`);
            const blob = await response.blob();
            setVideoUrl(URL.createObjectURL(blob));
            setStatus('success');
            setDisplayMessage('Render tamamlandı.');
        } catch (error) {
            setStatus('error');
            setDisplayMessage(`Hata: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
            {/* Remotion CLI'ın aradığı Composition tanımı burada. ID: MyVideo */}
            <div style={{ display: 'none' }}>
                <Composition
                    id="MyVideo"
                    component={MyVideoContent}
                    durationInFrames={150}
                    fps={30}
                    width={1920}
                    height={1080}
                />
            </div>

            <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #333', borderRadius: '5px' }}>
                <strong>Sistem Mesajı:</strong> <span style={{ color: status === 'error' ? '#ff4d4d' : '#4caf50' }}>{displayMessage}</span>
            </div>

            <div style={{ width: '100%', minHeight: '300px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {videoUrl ? (
                    <video ref={videoRef} src={videoUrl} controls autoPlay style={{ width: '100%' }} />
                ) : (
                    <p style={{ color: '#666' }}>{status === 'processing' ? 'İşleniyor...' : 'Video hazır değil.'}</p>
                )}
            </div>

            <button 
                onClick={() => sendCommandToRemote("Render başlat")}
                style={{ marginTop: '15px', padding: '10px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Komutu Gönder ve Render Et
            </button>
        </div>
    );
};

// Sistemi Remotion'a kaydet
registerRoot(VideoPreviewSystem);

export default VideoPreviewSystem;
