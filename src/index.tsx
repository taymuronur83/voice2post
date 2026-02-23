import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), { ssr: false });

const VideoElement = ({ title, accentColor }: any) => (
    <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', height: '100%', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '60px', color: accentColor || '#ff0055' }}>{title}</h1>
    </div>
);

export default function Voice2Post() {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState({ linkedin: '', twitter: '', videoTitle: '' });

    const handleGenerate = async () => {
        if (!userInput) return;
        setLoading(true);
        try {
            // HEM CLAUDE HEM VIDEO TETIKLEME
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput }),
            });
            const data = await res.json();

            if (data.success) {
                // CLAUDE'DAN GELEN METINLERI KUTULARA YAZDIR
                setContent({
                    linkedin: data.linkedinText || data.aiText, // Claude'dan gelen LinkedIn metni
                    twitter: data.twitterText || data.aiText,   // Claude'dan gelen Twitter metni
                    videoTitle: data.aiText.substring(0, 30)   // Videoda görünecek başlık
                });
            }
        } catch (err) {
            console.error("Sistem hatası:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Header Kısmı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <h2 style={{ fontWeight: 'bold' }}>VOICE2POST</h2>
                <button onClick={handleGenerate} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>
                    {loading ? 'ÜRETİLİYOR...' : 'Hemen Dene'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                {/* SOL: SOSYAL MEDYA METİNLERİ (Claude Çıktıları) */}
                <div style={{ width: '400px' }}>
                    <h3>SOSYAL MEDYA METİNLERİ</h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label>LINKEDIN POSTU</label>
                        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', minHeight: '80px', marginTop: '10px', border: '1px solid #334155' }}>
                            {content.linkedin || "Bekleniyor..."}
                        </div>
                    </div>

                    <div>
                        <label>X (TWITTER) AKIŞI</label>
                        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', minHeight: '80px', marginTop: '10px', border: '1px solid #334155' }}>
                            {content.twitter || "Bekleniyor..."}
                        </div>
                    </div>
                    
                    <textarea 
                        onChange={(e) => setUserInput(e.target.value)} 
                        placeholder="Komut ver..." 
                        style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '10px', background: '#000', color: '#fff' }}
                    />
                </div>

                {/* SAĞ: OLUŞTURULAN VİDEO (Remotion Önizleme) */}
                <div style={{ width: '360px' }}>
                    <h3>OLUŞTURULAN VİDEO</h3>
                    <div style={{ width: '300px', height: '533px', border: '8px solid #1e293b', borderRadius: '40px', overflow: 'hidden', marginTop: '20px', position: 'relative' }}>
                        {content.videoTitle ? (
                            <Player
                                component={VideoElement}
                                durationInFrames={150}
                                compositionWidth={1080}
                                compositionHeight={1920}
                                fps={30}
                                style={{ width: '100%', height: '100%' }}
                                autoPlay
                                loop
                                inputProps={{ title: content.videoTitle }}
                            />
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <div className="loader"></div>
                                <p>VİDEOYU HAZIRLIYORUZ...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`.loader { border: 4px solid #f3f3f3; border-top: 4px solid #db3487; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
