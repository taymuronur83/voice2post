import React, { useState, useEffect } from 'react';
import { registerRoot, Composition, Audio, useCurrentFrame, interpolate } from 'remotion';

// --- 1. CLAUDE VİDEO İÇERİĞİ (Dikey Format & Animasyonlar) ---
const SocialVideoContent = ({ title }: { title: string }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const scale = interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: 'clamp' });

    return (
        <div style={{ 
            flex: 1, backgroundColor: '#000', color: '#fff', 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', 
            alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif' 
        }}>
            {/* Arka plan figürü/animasyonu simülasyonu */}
            <div style={{ 
                position: 'absolute', width: '300px', height: '300px', 
                borderRadius: '50%', background: 'radial-gradient(circle, #007bff 0%, transparent 70%)',
                filter: 'blur(50px)', opacity: 0.4,
                transform: `scale(${1 + Math.sin(frame / 10) * 0.1})`
            }} />

            <div style={{ opacity, transform: `scale(${scale})`, zIndex: 10 }}>
                <h1 style={{ fontSize: '70px', marginBottom: '20px', lineHeight: '1.2' }}>{title}</h1>
                <div style={{ fontSize: '30px', color: '#007bff', fontWeight: 'bold' }}>🚀 İçerik Üretildi</div>
            </div>

            {/* Ses dosyası konuya göre API'den gelen URL ile değişebilir */}
            {/* <Audio src="https://your-server.com/bg-music.mp3" /> */}
        </div>
    );
};

// --- 2. ANA SİSTEM (OpenAI Metin + Claude Video) ---
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ twitter: '', linkedin: '', videoUrl: '' });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen bir komut girin!");
        setStatus('processing');

        try {
            // Vercel'deki OPENAI_API_KEY'i kullanan backend isteği
            const textRes = await fetch('/api/social-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            const textData = await textRes.json();

            // Vercel'deki ANTHROPIC_API_KEY'i (Claude) kullanan video render isteği
            const videoRes = await fetch('/api/video-render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            const videoBlob = await videoRes.blob();

            setOutputs({
                twitter: textData.twitter,
                linkedin: textData.linkedin,
                videoUrl: URL.createObjectURL(videoBlob)
            });
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#eee', overflow: 'hidden' }}>
            
            {/* SOL TARAF: OpenAI Metin Dünyası */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee' }}>Social Text Engine (OpenAI)</h2>
                <textarea 
                    placeholder="İsteğinizi buraya yazın (Örn: Yapay zeka hakkında bir tweet ve makale oluştur)"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    style={{ width: '100%', height: '120px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '10px', padding: '15px', marginBottom: '15px' }}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={status === 'processing'}
                    style={{ padding: '15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {status === 'processing' ? 'İşleniyor...' : 'Tüm Platformlar İçin Üret'}
                </button>

                <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ background: '#161616', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                        <strong style={{ color: '#00acee' }}>Twitter / X:</strong>
                        <p style={{ marginTop: '10px', lineHeight: '1.5' }}>{outputs.twitter || "..."}</p>
                    </div>
                    <div style={{ background: '#161616', padding: '15px', borderRadius: '10px' }}>
                        <strong style={{ color: '#0077b5' }}>LinkedIn:</strong>
                        <p style={{ marginTop: '10px', lineHeight: '1.5' }}>{outputs.linkedin || "..."}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ TARAF: Claude Video Dünyası */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <h2 style={{ color: '#f0f0f0', marginBottom: '20px' }}>Video Platform (Claude & Remotion)</h2>
                
                {/* DİKEY ÖNİZLEME (9:16) */}
                <div style={{ width: '320px', height: '568px', border: '4px solid #1a1a1a', borderRadius: '30px', overflow: 'hidden', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {outputs.videoUrl ? (
                        <video src={outputs.videoUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', padding: '20px' }}>
                            {status === 'processing' ? 'Video Oluşturuluyor...' : 'Hazır olduğunda burada görünecek.'}
                        </div>
                    )}
                </div>

                {/* ÖNEMLİ: Görseldeki 'MyVideo bulunamadı' hatasını çözen blok */}
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

// Sistemi kaydet
registerRoot(MainSocialSystem);

export default MainSocialSystem;
