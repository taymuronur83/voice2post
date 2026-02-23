import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Player'ı Next.js SSR hatası vermemesi için dinamik olarak yüklüyoruz
const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
    ssr: false,
});

// 1. VİDEO TASARIMI (Sadece telefon ekranı içinde görünecek olan kısım)
const VideoElement = ({ title, sub, accentColor, storyline = [] }: any) => {
    return (
        <div style={{ 
            flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', 
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            padding: '60px', textAlign: 'center', width: '100%', height: '100%',
            fontFamily: 'Arial, sans-serif', position: 'relative'
        }}>
            <div style={{ 
                position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
                background: `radial-gradient(circle, ${accentColor || '#3b82f6'}44 0%, transparent 70%)` 
            }} />
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: accentColor || '#3b82f6', zIndex: 10 }}>
                {title || "İçerik Hazırlanıyor..."}
            </h1>
            <p style={{ fontSize: '40px', zIndex: 10, marginTop: '30px', color: '#eee' }}>
                {storyline.length > 0 ? storyline[0] : sub}
            </p>
        </div>
    );
};

// 2. ANA SİTE ARAYÜZÜ
export default function MainSocialSystem() {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState<any>(null);

    const handleGenerate = async () => {
        if (!userInput) return alert("Komut girin!");
        setStatus('processing');
        
        try {
            // Claude ve GitHub tetikleyici API çağrısı
            const response = await fetch('/api/generate', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt: userInput }) 
            });
            
            const data = await response.json();
            
            if (data.success) {
                // API'den gelen verileri Player'a aktarıyoruz
                setOutputs({ 
                    twitter: data.aiText, // Claude'dan gelen metin
                    videoTitle: "AI Hazır", 
                    videoSub: "Video Render Başlatıldı", 
                    videoColor: "#2563eb", 
                    storyline: [data.aiText] 
                });
                setStatus('success');
            } else {
                setStatus('error');
                alert("Hata: " + data.error);
            }
        } catch (err) { 
            setStatus('error'); 
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL (Komut Girişi) */}
            <div style={{ width: '400px', padding: '40px', borderRight: '2px solid #222', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
                <h2 style={{ color: '#00acee', marginBottom: '20px' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '15px', padding: '20px', border: '1px solid #333', outline: 'none' }} 
                    placeholder="Komutunuzu buraya girin..." 
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={status === 'processing'}
                    style={{ 
                        padding: '20px', 
                        background: status === 'processing' ? '#444' : '#2563eb', 
                        color: '#fff', 
                        borderRadius: '12px', 
                        marginTop: '20px', 
                        fontWeight: 'bold', 
                        cursor: status === 'processing' ? 'not-allowed' : 'pointer', 
                        border: 'none' 
                    }}
                >
                    {status === 'processing' ? 'Claude İşliyor...' : 'İçeriği Oluştur ve Önizle'}
                </button>
                
                <div style={{ marginTop: '20px', background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                    <strong style={{ color: '#00acee' }}>AI Taslağı:</strong> 
                    <p style={{ fontSize: '14px', color: '#ccc', marginTop: '10px' }}>{outputs?.twitter || "Bekleniyor..."}</p>
                </div>
            </div>

            {/* SAĞ PANEL: ÖNİZLEME */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', position: 'relative' }}>
                <div style={{ 
                    width: '360px', 
                    height: '640px', 
                    border: '12px solid #1a1a1a', 
                    borderRadius: '50px', 
                    overflow: 'hidden', 
                    background: '#000',
                    boxShadow: '0 0 50px rgba(37, 99, 235, 0.2)'
                }}>
                    {status === 'success' && outputs ? (
                        <Player
                            component={VideoElement} 
                            durationInFrames={300}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            fps={30}
                            style={{ width: '100%', height: '100%' }}
                            autoPlay
                            loop
                            inputProps={{
                                title: outputs.videoTitle,
                                sub: outputs.videoSub,
                                accentColor: outputs.videoColor,
                                storyline: outputs.storyline
                            }}
                        />
                    ) : (
                        <div style={{ 
                            color: '#444', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{ width: '40px', height: '40px', border: '3px solid #222', borderRadius: '50%', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }}></div>
                            <p>Video bekleniyor...</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
