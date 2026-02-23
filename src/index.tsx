import React, { useState, useEffect } from 'react';
import { registerRoot, Composition, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

// Gemini API Key [cite: 2026-02-22]
const GEMINI_API_KEY = "AIzaSyDaZ3eZsoAKW3ZazFPebAd-b147KaW5wOA";

const SocialVideoContent = ({ 
    title, 
    sub, 
    accentColor, 
    storyline = [], 
    animConfig 
}: { 
    title: string; 
    sub: string; 
    accentColor: string; 
    storyline?: string[];
    animConfig?: any;
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const config = animConfig || { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 };
    
    const scenes = storyline.length > 0 ? storyline : [sub];
    const framesPerScene = durationInFrames / scenes.length;
    const currentSceneIndex = Math.min(Math.floor(frame / framesPerScene), scenes.length - 1);
    const currentText = scenes[currentSceneIndex];

    const sceneFrame = frame % framesPerScene;
    const entrance = spring({ frame: sceneFrame, fps, config: { damping: 12, stiffness: 100 } });
    const scale = interpolate(sceneFrame, [0, framesPerScene], [1, config.zoomScale]);
    const shake = Math.sin(frame * config.textSpeed) * config.shakeIntensity;

    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`, transform: `scale(${1 + Math.sin(frame/20)*0.1})` }} />
            <h1 style={{ fontSize: '90px', fontWeight: 'bold', transform: `scale(${1 + Math.sin(frame/30)*0.05}) translate(${shake}px, ${shake}px)`, color: accentColor, lineHeight: '1.1', zIndex: 10 }}>{title}</h1>
            <div style={{ height: '350px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
                <p style={{ fontSize: '48px', opacity: entrance, transform: `scale(${scale}) translateY(${(1 - entrance) * 30}px)`, fontWeight: '500', color: '#eee' }}>{currentText}</p>
            </div>
            <div style={{ position: 'absolute', bottom: 50, left: 100, right: 100, height: 8, background: '#222', borderRadius: 4 }}>
                <div style={{ width: `${(frame / durationInFrames) * 100}%`, height: '100%', background: accentColor, borderRadius: 4 }} />
            </div>
        </div>
    );
};

const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ twitter: '', linkedin: '', videoTitle: '', videoSub: '', videoColor: '#3b82f6', storyline: [] as string[], animConfig: null });
    const [videoKey, setVideoKey] = useState(Date.now());

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const videoDataRaw = params.get("videoData");
        if (videoDataRaw) {
            try {
                const decoded = JSON.parse(decodeURIComponent(videoDataRaw));
                setOutputs({ twitter: '', linkedin: '', videoTitle: decoded.title || "", videoSub: decoded.sub || "", videoColor: decoded.accentColor || "#3b82f6", storyline: decoded.storyline || [], animConfig: decoded.animation || null });
                setStatus('success');
            } catch (e) { console.error(e); }
        }
    }, []);

    const handleGenerate = async () => {
        if (!userInput) return alert("Komut girin!");
        setStatus('processing');
        try {
            const response = await fetch('/api/generate', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt: userInput, key: GEMINI_API_KEY }) 
            });
            const data = await response.json();
            setOutputs({ twitter: data.twitter, linkedin: data.linkedin, videoTitle: data.video_script.title, videoSub: data.video_script.sub, videoColor: data.video_script.accentColor, storyline: data.video_script.storyline || [], animConfig: data.video_script.animation });
            
            await fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });
            
            setStatus('success');
            
            // OTOMATİK TAZELEME: Vercel'i beklemeden doğrudan GitHub'ı kontrol eder
            const autoRefresh = setInterval(() => {
                setVideoKey(Date.now());
                console.log("Video güncelleniyor...");
            }, 10000); // 10 saniyede bir dene
            
            setTimeout(() => clearInterval(autoRefresh), 300000); // 5 dakika boyunca denemeye devam et

        } catch (err) { setStatus('error'); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL: Tıklama alanı (zIndex ile üstte) */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 100 }}>
                <h2 style={{ color: '#00acee', marginBottom: '15px' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '10px', padding: '15px', border: '1px solid #333' }} 
                    placeholder="Ne anlatmak istersin?" 
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '15px', background: '#2563eb', color: '#fff', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                >
                    {status === 'processing' ? 'İşleniyor...' : 'Üret'}
                </button>
                <div style={{ marginTop: '20px', overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}><strong>X:</strong> <p>{outputs.twitter}</p></div>
                    <div style={{ background: '#111', padding: '10px', borderRadius: '10px' }}><strong>LinkedIn:</strong> <p>{outputs.linkedin}</p></div>
                </div>
            </div>

            {/* SAĞ PANEL: Video Ekranı (Doğrudan GitHub CDN Bağlantılı) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '320px', height: '568px', border: '8px solid #1a1a1a', borderRadius: '40px', overflow: 'hidden', position: 'relative' }}>
                    {status === 'success' ? (
                        <>
                            <video 
                                key={videoKey}
                                controls 
                                autoPlay 
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 50, backgroundColor: 'black' }} 
                            >
                                {/* KESİN ÇÖZÜM LİNKİ: media.githubusercontent Vercel'den bağımsız çalışır */}
                                <source src={`https://media.githubusercontent.com/media/taymuronur83/voice2post/main/public/outputs/final-video.mp4?t=${videoKey}`} type="video/mp4" />
                            </video>
                            <SocialVideoContent title={outputs.videoTitle} sub={outputs.videoSub} accentColor={outputs.videoColor} storyline={outputs.storyline} animConfig={outputs.animConfig} />
                        </>
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '70%', padding: '20px' }}>
                            {status === 'processing' ? 'Video Hazırlanıyor...' : 'Komut Bekleniyor...'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RemotionRoot: React.FC = () => (
    <>
      <Composition id="MyVideo" component={SocialVideoContent} durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{ title: "BAŞLIK", sub: "ALT BAŞLIK", accentColor: "#3b82f6", storyline: ["Bekleniyor..."], animConfig: null }} />
      <MainSocialSystem />
    </>
);
registerRoot(RemotionRoot);
