import React, { useState, useEffect } from 'react';
import { registerRoot, Composition, useCurrentFrame, interpolate } from 'remotion';

// --- VİDEO İÇERİĞİ ---
const SocialVideoContent = ({ 
    title, 
    sub, 
    accentColor,
    animConfig 
}: { 
    title: string; 
    sub: string; 
    accentColor: string; 
    animConfig?: any;
}) => {
    const frame = useCurrentFrame();
    const config = animConfig || { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 };
    
    const scale = interpolate(frame, [0, 150], [1, config.zoomScale]);
    const shake = Math.sin(frame * config.textSpeed) * config.shakeIntensity;

    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`, transform: `scale(${1 + Math.sin(frame/20)*0.1})` }} />

            <h1 style={{ 
                fontSize: '90px', fontWeight: 'bold', 
                transform: `scale(${scale}) translate(${shake}px, ${shake}px)`, 
                color: accentColor,
                lineHeight: '1.1', zIndex: 1 
            }}>
                {title}
            </h1>

            <p style={{ fontSize: '45px', opacity: 0.8, marginTop: '20px', zIndex: 1 }}>
                {sub}
            </p>
        </div>
    );
};

// --- ANA ARAYÜZ ---
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ 
        twitter: '', linkedin: '', videoTitle: '', videoSub: '', videoColor: '#3b82f6',
        animConfig: null 
    });

    // URL'den gelen veriyi yakalamak için güncelleme
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const videoDataRaw = params.get("videoData");
        if (videoDataRaw) {
            try {
                const decoded = JSON.parse(decodeURIComponent(videoDataRaw));
                setOutputs({
                    twitter: '',
                    linkedin: '',
                    videoTitle: decoded.title || "",
                    videoSub: decoded.sub || "",
                    videoColor: decoded.accentColor || "#3b82f6",
                    animConfig: decoded.animation || null
                });
                setStatus('success');
            } catch (e) { console.error("URL verisi okunamadı", e); }
        }
    }, []);

    const handleGenerate = async () => {
        if (!userInput) return alert("Komut girin!");
        setStatus('processing');
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            const data = await response.json();

            setOutputs({
                twitter: data.twitter,
                linkedin: data.linkedin,
                videoTitle: data.video_script.title,
                videoSub: data.video_script.sub,
                videoColor: data.video_script.accentColor,
                animConfig: data.video_script.animation
            });
            setStatus('success');
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee', marginBottom: '15px' }}>OpenAI Metin Üretici</h2>
                <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '10px', padding: '15px' }} />
                <button onClick={handleGenerate} style={{ padding: '15px', background: '#2563eb', color: '#fff', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold' }}>
                    {status === 'processing' ? 'İşleniyor...' : 'Üret'}
                </button>
                <div style={{ marginTop: '20px' }}>
                    <div style={{ background: '#111', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}><strong>X:</strong> <p>{outputs.twitter}</p></div>
                    <div style={{ background: '#111', padding: '10px', borderRadius: '10px' }}><strong>LinkedIn:</strong> <p>{outputs.linkedin}</p></div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '320px', height: '568px', border: '8px solid #1a1a1a', borderRadius: '40px', overflow: 'hidden' }}>
                    {status === 'success' ? (
                        <SocialVideoContent 
                            title={outputs.videoTitle} 
                            sub={outputs.videoSub} 
                            accentColor={outputs.videoColor} 
                            animConfig={outputs.animConfig}
                        />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '70%' }}>Hazırlanıyor...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={SocialVideoContent}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
            title: "Örnek Başlık",
            sub: "ALT BAŞLIK",
            accentColor: "#3b82f6",
            animConfig: null
        }}
      />
      <MainSocialSystem />
    </>
  );
};

registerRoot(RemotionRoot);
