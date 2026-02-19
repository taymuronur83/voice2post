import React, { useState } from 'react';
import { registerRoot, Composition, useCurrentFrame, interpolate } from 'remotion';

// --- VİDEO BİLEŞENİ (Dikey Format) ---
const SocialVideoContent = ({ title }: { title: string }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 20], [0, 1]);

    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ opacity, zIndex: 10 }}>
                <h1 style={{ fontSize: '80px', fontWeight: 'bold', textShadow: '0 0 20px rgba(0,123,255,0.5)' }}>
                    {title || "AI Video"}
                </h1>
            </div>
        </div>
    );
};

// --- ANA PANEL ---
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ twitter: '', linkedin: '', videoUrl: '' });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen bir giriş yapın!");
        setStatus('processing');

        try {
            // Mevcut api/generate.js dosyanı kullanarak OpenAI ve Claude verilerini çekiyoruz
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });

            const data = await response.json();
            
            // Backend'den gelen verileri yerleştiriyoruz
            setOutputs({
                twitter: data.twitter,
                linkedin: data.linkedin,
                videoUrl: data.videoUrl // api/render-video.js sonucunu buraya bağla
            });
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            
            {/* SOL: OpenAI Metin Alanı */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee', marginBottom: '15px' }}>Social Engine (OpenAI)</h2>
                <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Sosyal medya stratejinizi buraya yazın..."
                    style={{ width: '100%', height: '120px', background: '#111', color: '#fff', borderRadius: '10px', padding: '15px', border: '1px solid #333' }}
                />
                <button 
                    onClick={handleGenerate}
                    style={{ padding: '15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
                >
                    {status === 'processing' ? 'Üretiliyor...' : 'Tüm Platformlar İçin Oluştur'}
                </button>

                <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #222' }}>
                        <strong style={{ color: '#1DA1F2' }}>𝕏 Twitter:</strong>
                        <p style={{ marginTop: '8px', fontSize: '14px' }}>{outputs.twitter || "Veri bekleniyor..."}</p>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <strong style={{ color: '#0A66C2' }}>LinkedIn:</strong>
                        <p style={{ marginTop: '8px', fontSize: '14px' }}>{outputs.linkedin || "Veri bekleniyor..."}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ: Claude Video Alanı */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <h2 style={{ color: '#fff', marginBottom: '20px' }}>Video Platform (Claude)</h2>
                <div style={{ width: '320px', height: '568px', border: '6px solid #1a1a1a', borderRadius: '35px', overflow: 'hidden', backgroundColor: '#080808' }}>
                    {outputs.videoUrl ? (
                        <video src={outputs.videoUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '50%' }}>
                            {status === 'processing' ? 'Claude Videoyu İşliyor...' : 'Video Hazır Değil'}
                        </div>
                    )}
                </div>

                {/* HATAYI ÇÖZEN KRİTİK KAYIT BÖLÜMÜ */}
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
