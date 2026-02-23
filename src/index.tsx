import React, { useState, useEffect } from 'react';
import { registerRoot, Composition, useCurrentFrame, interpolate, spring, useVideoConfig, Player } from '@remotion/player';

// Gemini API Key - Mevcut sistemini korur
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
    const { durationInFrames } = useVideoConfig();
    const config = animConfig || { shakeIntensity: 2, zoomScale: 1.1, textSpeed: 1 };
    
    const scenes = storyline.length > 0 ? storyline : [sub];
    const framesPerScene = durationInFrames / scenes.length;
    const currentSceneIndex = Math.min(Math.floor(frame / framesPerScene), scenes.length - 1);
    const currentText = scenes[currentSceneIndex];

    const sceneFrame = frame % framesPerScene;
    const scale = interpolate(sceneFrame, [0, framesPerScene], [1, config.zoomScale]);
    const shake = Math.sin(frame * config.textSpeed) * config.shakeIntensity;

    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)` }} />
            <h1 style={{ fontSize: '70px', fontWeight: 'bold', transform: `translate(${shake}px, ${shake}px)`, color: accentColor, zIndex: 10 }}>{title}</h1>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
                <p style={{ fontSize: '40px', transform: `scale(${scale})`, fontWeight: '500', color: '#eee' }}>{currentText}</p>
            </div>
        </div>
    );
};

const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ 
        twitter: '', 
        linkedin: '', 
        videoTitle: '', 
        videoSub: '', 
        videoColor: '#3b82f6', 
        storyline: [] as string[], 
        animConfig: null 
    });

    const handleGenerate = async () => {
        if (!userInput) return alert("Komut girin!");
        setStatus('processing');
        try {
            // 1. Metin ve Video Script Üretimi
            const response = await fetch('/api/generate', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt: userInput, key: GEMINI_API_KEY }) 
            });
            const data = await response.json();
            
            setOutputs({ 
                twitter: data.twitter, 
                linkedin: data.linkedin, 
                videoTitle: data.video_script.title, 
                videoSub: data.video_script.sub, 
                videoColor: data.video_script.accentColor, 
                storyline: data.video_script.storyline || [], 
                animConfig: data.video_script.animation 
            });

            // 2. Arka Planda Render Tetikleme (GitHub Action çalışmaya devam eder)
            fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });

            // 3. Status'ü Başarılıya Çek (Player anında devreye girer)
            setStatus('success');
        } catch (err) { 
            setStatus('error'); 
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 100 }}>
                <h2 style={{ color: '#00acee' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '10px', padding: '15px' }} 
                    placeholder="Komutunuzu buraya yazın..." 
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '15px', background: '#2563eb', color: '#fff', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {status === 'processing' ? 'İşleniyor...' : 'İçerik Üret'}
                </button>
                
                <div style={{ marginTop: '20px', overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                        <strong>X (Twitter):</strong>
                        <p>{outputs.twitter}</p>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px' }}>
                        <strong>LinkedIn:</strong>
                        <p>{outputs.linkedin}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: Player Teknolojisi (Dosya yüklenmesini beklemez, anında oynatır) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '320px', height: '568px', border: '8px solid #1a1a1a', borderRadius: '40px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                    {status === 'success' ? (
                        <Player
                            component={SocialVideoContent}
                            durationInFrames={450}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            fps={30}
                            style={{ width: '100%', height: '100%' }}
                            controls
                            autoPlay
                            loop
                            inputProps={{
                                title: outputs.videoTitle,
                                sub: outputs.videoSub,
                                accentColor: outputs.videoColor,
                                storyline: outputs.storyline,
                                animConfig: outputs.animConfig
                            }}
                        />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '70%', padding: '20px' }}>
                            {status === 'processing' ? 'AI İçerik Hazırlıyor...' : 'Hazır. Komutunuzu Bekliyorum.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Remotion Kaydı
export const RemotionRoot: React.FC = () => (
    <MainSocialSystem />
);

registerRoot(RemotionRoot);
