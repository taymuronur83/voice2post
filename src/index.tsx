import React, { useState } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

// VİDEO TASARIMI
const SocialVideoContent = ({ title, sub, accentColor, storyline = [] }: any) => {
    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)` }} />
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: accentColor, zIndex: 10 }}>{title}</h1>
            <p style={{ fontSize: '42px', zIndex: 10, marginTop: '20px' }}>{storyline[0] || sub}</p>
        </div>
    );
};

// ANA ARAYÜZ
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ twitter: '', linkedin: '', videoTitle: '', videoSub: '', videoColor: '#3b82f6', storyline: [] as string[] });

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
                storyline: data.video_script.storyline || [] 
            });

            // Player'ı otomatik başlat
            setStatus('success');

            // Arka planda GitHub render'ı başlat
            fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });
        } catch (err) { setStatus('error'); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '40px', borderRight: '1px solid #222' }}>
                <h2 style={{ color: '#00acee' }}>Voice2Post AI</h2>
                <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '15px', padding: '20px' }} placeholder="Komut yazın..." />
                <button onClick={handleGenerate} style={{ padding: '20px', background: '#2563eb', color: '#fff', borderRadius: '12px', marginTop: '20px', width: '100%', fontWeight: 'bold' }}>
                    {status === 'processing' ? 'Oluşturuluyor...' : 'İçeriği Üret ve Otomatik Oynat'}
                </button>
                <div style={{ marginTop: '20px' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}><strong>X:</strong> <p>{outputs.twitter}</p></div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px' }}><strong>LinkedIn:</strong> <p>{outputs.linkedin}</p></div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '360px', height: '640px', border: '12px solid #1a1a1a', borderRadius: '50px', overflow: 'hidden' }}>
                    {status === 'success' ? (
                        <Player
                            component={SocialVideoContent}
                            durationInFrames={300}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            fps={30}
                            style={{ width: '100%', height: '100%' }}
                            autoPlay loop
                            inputProps={outputs}
                        />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '80%' }}>Video otomatik başlayacak.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// REMOTION ROOT - Render motorunun görmesi gereken yer
export const RemotionRoot: React.FC = () => {
    return (
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
};

registerRoot(RemotionRoot);
