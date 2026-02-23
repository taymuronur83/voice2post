import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), { ssr: false });

// Video Tasarımı
const VideoElement = ({ title }: { title: string }) => (
    <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', height: '100%', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '60px', fontWeight: 'bold' }}>{title}</h1>
    </div>
);

export default function Voice2Post() {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState({ linkedin: '', twitter: '', videoTitle: '' });

    const handleGenerate = async () => {
        if (!userInput) return alert("Komut girin!");
        setLoading(true);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput }),
            });
            const data = await res.json();

            if (data.success) {
                // CLAUDE'DAN GELEN VERİLER KUTULARA BASILIYOR
                setContent({
                    linkedin: data.linkedinText,
                    twitter: data.twitterText,
                    videoTitle: data.videoTitle
                });
            } else {
                alert("Hata: " + data.error);
            }
        } catch (err) {
            alert("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'Arial' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>VOICE2POST AI</h1>
                    <button onClick={handleGenerate} disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 30px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loading ? 'ÜRETİLİYOR...' : 'İÇERİĞİ OLUŞTUR'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '40px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: '#94a3b8' }}>LINKEDIN POSTU</label>
                            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', minHeight: '100px', marginTop: '10px', border: '1px solid #334155' }}>
                                {content.linkedin || "İçerik bekleniyor..."}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: '#94a3b8' }}>X (TWITTER) POSTU</label>
                            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', minHeight: '100px', marginTop: '10px', border: '1px solid #334155' }}>
                                {content.twitter || "İçerik bekleniyor..."}
                            </div>
                        </div>
                        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Yapay zekaya komut ver..." style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#000', color: '#fff', border: '1px solid #334155' }} />
                    </div>

                    <div style={{ width: '360px' }}>
                        <div style={{ width: '360px', height: '640px', border: '10px solid #1e293b', borderRadius: '45px', overflow: 'hidden', backgroundColor: '#000' }}>
                            {content.videoTitle ? (
                                <Player component={VideoElement} durationInFrames={120} compositionWidth={1080} compositionHeight={1920} fps={30} style={{ width: '100%', height: '100%' }} autoPlay loop inputProps={{ title: content.videoTitle }} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                    <p>VİDEO ÖNİZLEME</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
