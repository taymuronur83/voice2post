import React, { useState } from 'react';
import { registerRoot, Composition, useCurrentFrame } from 'remotion';

// --- VİDEO İÇERİĞİ (Dikey Format) ---
const SocialVideoContent = ({ title }: { title: string }) => {
    const frame = useCurrentFrame();
    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '80px', transform: `scale(${1 + Math.sin(frame / 10) * 0.05})` }}>
                {title || "Yükleniyor..."}
            </h1>
        </div>
    );
};

// --- ANA ARAYÜZ (Sol Metin, Sağ Video) ---
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ twitter: '', linkedin: '', videoUrl: '' });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen bir komut girin!");
        setStatus('processing');
        try {
            // Görsel 5'teki api/generate.js dosyana istek atar
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            const data = await response.json();
            setOutputs({
                twitter: data.twitter,
                linkedin: data.linkedin,
                videoUrl: data.videoUrl // API'den gelen dikey video linki
            });
            setStatus('success');
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL: OpenAI Metin Dünyası */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee' }}>OpenAI Metin Üretici</h2>
                <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Sosyal medya isteğinizi yazın..."
                    style={{ width: '100%', height: '120px', background: '#111', color: '#fff', borderRadius: '10px', padding: '15px' }}
                />
                <button onClick={handleGenerate} style={{ padding: '15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
                    {status === 'processing' ? 'AI İşliyor...' : 'Tüm Platformlar İçin Üret'}
                </button>
                <div style={{ marginTop: '20px' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                        <strong>Twitter:</strong> <p>{outputs.twitter || "..."}</p>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px' }}>
                        <strong>LinkedIn:</strong> <p>{outputs.linkedin || "..."}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: Claude Video Önizleme */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <h2 style={{ marginBottom: '20px' }}>Claude Video Preview</h2>
                <div style={{ width: '320px', height: '568px', border: '6px solid #1a1a1a', borderRadius: '35px', overflow: 'hidden' }}>
                    {outputs.videoUrl ? (
                        <video src={outputs.videoUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '50%' }}>
                            {status === 'processing' ? 'Video Üretiliyor...' : 'Video Hazır Değil'}
                        </div>
                    )}
                </div>

                {/* GÖRSELDEKİ "MyVideo" HATASINI ÇÖZEN KRİTİK BÖLÜM */}
                <div style={{ display: 'none' }}>
                    <Composition
                        id="MyVideo" 
                        component={SocialVideoContent}
                        durationInFrames={150}
                        fps={30}
                        width={1080}
                        height={1920}
                        defaultProps={{ title: userInput }}
                    />
                </div>
            </div>
        </div>
    );
};

registerRoot(MainSocialSystem);
