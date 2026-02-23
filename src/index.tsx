import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Player'ı SSR hatası almamak için dinamik yüklüyoruz
const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), { ssr: false });

// Video Önizleme Tasarımı
const VideoElement = ({ title }: { title: string }) => (
    <div style={{ 
        flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', padding: '40px', 
        textAlign: 'center', height: '100%', fontFamily: 'sans-serif',
        background: 'radial-gradient(circle, #2563eb44 0%, #000 100%)'
    }}>
        <h1 style={{ fontSize: '60px', fontWeight: 'bold' }}>{title}</h1>
    </div>
);

export default function Voice2Post() {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState({ linkedin: '', twitter: '', videoTitle: '' });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen bir komut girin!");
        setLoading(true);
        setContent({ linkedin: '', twitter: '', videoTitle: '' }); // Eski içerikleri temizle

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput }),
            });
            const data = await res.json();

            if (data.success) {
                setContent({
                    linkedin: data.linkedinText,
                    twitter: data.twitterText,
                    videoTitle: data.aiText
                });
            } else {
                alert("Hata: " + data.error);
            }
        } catch (err) {
            alert("Sistemle bağlantı kurulamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'Arial' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>VOICE2POST AI</h1>
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 30px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? 'ÜRETİLİYOR...' : 'İÇERİĞİ OLUŞTUR'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '40px' }}>
                    
                    {/* SOL PANEL: Metin Çıktıları */}
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ fontSize: '12px', color: '#94a3b8' }}>LINKEDIN POSTU</label>
                            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', minHeight: '100px', marginTop: '10px', border: '1px solid #334155', lineHeight: '1.6' }}>
                                {content.linkedin || "İçerik buraya gelecek..."}
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ fontSize: '12px', color: '#94a3b8' }}>X (TWITTER) POSTU</label>
                            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', minHeight: '100px', marginTop: '10px', border: '1px solid #334155', lineHeight: '1.6' }}>
                                {content.twitter || "İçerik buraya gelecek..."}
                            </div>
                        </div>

                        <textarea 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Yapay zekaya komut ver (Örn: Girişimcilik hakkında video yap)" 
                            style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#000', color: '#fff', border: '1px solid #334155', outline: 'none' }}
                        />
                    </div>

                    {/* SAĞ PANEL: Video Önizleme */}
                    <div style={{ width: '360px', textAlign: 'center' }}>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>VİDEO ÖNİZLEME</label>
                        <div style={{ width: '360px', height: '640px', border: '10px solid #1e293b', borderRadius: '45px', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
                            {content.videoTitle ? (
                                <Player
                                    component={VideoElement}
                                    durationInFrames={120}
                                    compositionWidth={1080}
                                    compositionHeight={1920}
                                    fps={30}
                                    style={{ width: '100%', height: '100%' }}
                                    autoPlay
                                    loop
                                    inputProps={{ title: content.videoTitle }}
                                />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#475569' }}>
                                    <p>{loading ? 'Video Hazırlanıyor...' : 'Komut Bekleniyor'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
