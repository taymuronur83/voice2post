import React, { useState, useEffect } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

/**
 * ÖNEMLİ: Claude API Key Vercel üzerindeki ANTHROPIC_API_KEY değişkeninden 
 * backend (api/generate) üzerinden okunmaktadır. [cite: 2026-02-22]
 */

const SocialVideoContent = ({ 
    title, 
    sub, 
    accentColor, 
    storyline = [] 
}: { 
    title: string; 
    sub: string; 
    accentColor: string; 
    storyline?: string[];
}) => {
    return (
        <div style={{ 
            flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', 
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            padding: '60px', textAlign: 'center', width: '100%', height: '100%' 
        }}>
            <div style={{ 
                position: 'absolute', width: '100%', height: '100%', 
                background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)` 
            }} />
            <h1 style={{ fontSize: '70px', fontWeight: 'bold', color: accentColor, zIndex: 10 }}>{title}</h1>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
                <p style={{ fontSize: '40px', fontWeight: '500', color: '#eee' }}>
                    {storyline.length > 0 ? storyline[0] : sub}
                </p>
            </div>
        </div>
    );
};

const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ 
        twitter: '', linkedin: '', videoTitle: '', videoSub: '', videoColor: '#3b82f6', storyline: [] as string[] 
    });
    const [lastRenderTime, setLastRenderTime] = useState(Date.now());

    const handleGenerate = async () => {
        if (!userInput) return alert("Komut girin!");
        setStatus('processing');
        try {
            // 1. AI İçerik Üretimi
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
                storyline: data.video_script.storyline || [] 
            });

            // 2. Video Render İşlemini GitHub Üzerinden Tetikle [cite: 2026-02-22]
            await fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });

            setStatus('success');
            // Video linkini tazelemek için zaman damgasını güncelle
            setLastRenderTime(Date.now());

        } catch (err) { 
            setStatus('error'); 
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
                <h2 style={{ color: '#00acee' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '12px', padding: '15px' }} 
                    placeholder="Komutunuzu buraya yazın..." 
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '15px', background: '#2563eb', color: '#fff', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {status === 'processing' ? 'Üretiliyor...' : 'Oluştur ve Göster'}
                </button>
                <div style={{ marginTop: '20px', overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                        <strong>X:</strong> <p>{outputs.twitter}</p>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px' }}>
                        <strong>LinkedIn:</strong> <p>{outputs.linkedin}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: DİKEY VİDEO EKRANI */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '340px', height: '600px', border: '10px solid #1a1a1a', borderRadius: '45px', overflow: 'hidden', position: 'relative' }}>
                    {status === 'success' ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {/* ÖNCE CANLI ÖNİZLEME (Player) GÖSTERİR [cite: 2026-02-17] */}
                            <Player
                                component={SocialVideoContent}
                                durationInFrames={300}
                                compositionWidth={1080}
                                compositionHeight={1920}
                                fps={30}
                                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, zIndex: 1 }}
                                autoPlay loop
                                inputProps={outputs}
                            />
                            
                            {/* ARKA PLANDA GİTHUB'DAN GELEN GERÇEK MP4'Ü DENER [cite: 2026-02-22] */}
                            <video 
                                key={lastRenderTime}
                                controls 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, zIndex: 2, background: 'transparent' }}
                            >
                                <source 
                                    src={`https://raw.githubusercontent.com/taymuronur83/voice2post/main/public/outputs/final-video.mp4?v=${lastRenderTime}`} 
                                    type="video/mp4" 
                                />
                            </video>
                        </div>
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '80%' }}>
                            {status === 'processing' ? 'AI Hazırlıyor...' : 'Video burada otomatik oynayacak.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// REMOTION ROOT - Render motoru ve site için ortak giriş [cite: 2026-02-22]
export const RemotionRoot: React.FC = () => (
    <>
        <Composition 
            id="MyVideo" 
            component={SocialVideoContent} 
            durationInFrames={300} 
            fps={30} 
            width={1080} 
            height={1920} 
        />
        <MainSocialSystem />
    </>
);

registerRoot(RemotionRoot);
