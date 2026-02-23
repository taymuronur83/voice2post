import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), { ssr: false });

const VideoElement = ({ title, sub, accentColor }: any) => (
    <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', height: '100%', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '80px', height: '8px', backgroundColor: accentColor || '#3b82f6', marginBottom: '20px', borderRadius: '10px' }} />
        <h1 style={{ fontSize: '60px', fontWeight: 'bold', lineHeight: 1.1 }}>{title}</h1>
        <p style={{ fontSize: '24px', color: accentColor || '#3b82f6', marginTop: '20px' }}>{sub}</p>
    </div>
);

export default function Voice2Post() {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [content, setContent] = useState({ linkedin: '', twitter: '', videoTitle: '', video_script: null as any });

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
                setContent({
                    linkedin: data.linkedinText,
                    twitter: data.twitterText,
                    videoTitle: data.videoTitle,
                    video_script: data.video_script
                });
            }
        } catch (err) { alert("Hata oluştu."); }
        finally { setLoading(false); }
    };

    const handleRenderVideo = async () => {
        if (!content.video_script) return alert("Önce içerik üretmelisiniz!");
        setIsRendering(true);
        try {
            const res = await fetch('/api/render-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script: content.video_script }),
            });
            const data = await res.json();
            alert(data.message || "Render başlatıldı!");
        } catch (err) { alert("Render hatası."); }
        finally { setIsRendering(false); }
    };

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'Arial' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>VOICE2POST AI</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {content.video_script && (
                            <button onClick={handleRenderVideo} disabled={isRendering} style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 30px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                {isRendering ? 'RENDER BAŞLADI...' : 'VİDEOYU İNDİR (MP4)'}
                            </button>
                        )}
                        <button onClick={handleGenerate} disabled={loading} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 30px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                            {loading ? 'ÜRETİLİYOR...' : 'İÇERİĞİ OLUŞTUR'}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '40px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px' }}>LINKEDIN (OpenAI)</label>
                            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', minHeight: '100px', border: '1px solid #334155', marginTop: '5px' }}>{content.linkedin}</div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px' }}>X (Twitter) (OpenAI)</label>
                            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', minHeight: '100px', border: '1px solid #334155', marginTop: '5px' }}>{content.twitter}</div>
                        </div>
                        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Buraya yazın..." style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#000', color: '#fff', border: '1px solid #334155', minHeight: '100px' }} />
                    </div>
                    <div style={{ width: '360px' }}>
                        <div style={{ width: '360px', height: '640px', border: '10px solid #1e293b', borderRadius: '45px', overflow: 'hidden', backgroundColor: '#000' }}>
                            {content.video_script ? (
                                <Player component={VideoElement} durationInFrames={150} compositionWidth={1080} compositionHeight={1920} fps={30} style={{ width: '100%', height: '100%' }} autoPlay loop inputProps={content.video_script} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>VİDEO ÖNİZLEME</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
