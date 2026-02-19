import React, { useState, useEffect } from 'react';
import { registerRoot, Composition, useCurrentFrame, interpolate, Audio } from 'remotion';

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
            {/* Animasyonlu Arka Plan Figürü */}
            <div style={{ 
                position: 'absolute', width: '400px', height: '400px', 
                borderRadius: '50%', background: 'radial-gradient(circle, #007bff 0%, transparent 70%)',
                filter: 'blur(60px)', opacity: 0.3,
                transform: `scale(${1 + Math.sin(frame / 15) * 0.2})`
            }} />

            <div style={{ opacity, transform: `scale(${scale})`, zIndex: 10 }}>
                <h1 style={{ fontSize: '80px', marginBottom: '30px', fontWeight: 'bold', textShadow: '0 0 20px rgba(0,123,255,0.5)' }}>
                    {title || "Yükleniyor..."}
                </h1>
                <div style={{ fontSize: '35px', color: '#007bff', letterSpacing: '2px' }}>✨ CLAUDE AI GENERATED</div>
            </div>
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
            // Vercel'deki OPENAI_API_KEY ve ANTHROPIC_API_KEY'i kullanan TEK API isteği
            // Not: Bu endpoint'in backend tarafında oluşturulmuş olması gerekir.
            const response = await fetch('/api/generate-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });

            if (!response.ok) throw new Error("Sunucu yanıt vermedi. API Route kontrol edilmeli.");

            const data = await response.json();

            setOutputs({
                twitter: data.twitter,
                linkedin: data.linkedin,
                videoUrl: data.videoUrl // Render edilmiş video linki veya blob
            });
            setStatus('success');
        } catch (err) {
            console.error("Render Hatası:", err);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            
            {/* SOL PANEL: OpenAI Metin (Twitter & LinkedIn) */}
            <div style={{ flex: 1, padding: '40px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee', marginBottom: '20px' }}>Social Engine (OpenAI)</h2>
                <textarea 
                    placeholder="Sosyal medya için ne üretmek istersiniz?"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '12px', padding: '20px', fontSize: '16px', outline: 'none' }}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={status === 'processing'}
                    style={{ padding: '18px', background: status === 'processing' ? '#333' : '#007bff', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', marginTop: '15px', transition: '0.3s' }}
                >
                    {status === 'processing' ? 'AI İşliyor...' : 'Tüm Platformlar İçin Oluştur'}
                </button>

                <div style={{ marginTop: '30px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #222' }}>
                        <strong style={{ color: '#1DA1F2' }}>𝕏 Twitter (OpenAI)</strong>
                        <p style={{ marginTop: '12px', color: '#ccc', lineHeight: '1.6' }}>{outputs.twitter || "İçerik bekleniyor..."}</p>
                    </div>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
                        <strong style={{ color: '#0A66C2' }}>Linkedln (OpenAI)</strong>
                        <p style={{ marginTop: '12px', color: '#ccc', lineHeight: '1.6' }}>{outputs.linkedin || "İçerik bekleniyor..."}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: Claude & Remotion Video Preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <h2 style={{ color: '#ff4d4d', marginBottom: '25px' }}>Video Preview (Claude)</h2>
                
                {/* 9:16 DİKEY FORMAT */}
                <div style={{ width: '340px', height: '600px', border: '6px solid #1a1a1a', borderRadius: '40px', overflow: 'hidden', backgroundColor: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0,123,255,0.1)' }}>
                    {outputs.videoUrl ? (
                        <video src={outputs.videoUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', padding: '30px' }}>
                            {status === 'processing' ? 'Claude Videoyu Oluşturuyor...' : 'Video Hazır Değil'}
                        </div>
                    )}
                </div>

                {/* GÖRSELDEKİ "MyVideo NOT FOUND" HATASINI ÇÖZEN TANIM */}
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

// Sistemi sisteme kaydet
registerRoot(MainSocialSystem);

export default MainSocialSystem;
