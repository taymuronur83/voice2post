import React, { useState } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

/** * 1. TASARIM BİLEŞENİ (SADECE VİDEO)
 * Bu bileşen dikey ekranın içinde görünecek olan tek şeydir.
 */
const VideoLayout = ({ title, sub, accentColor, storyline = [] }: any) => {
    return (
        <div style={{ 
            flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', 
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            padding: '60px', textAlign: 'center', width: '100%', height: '100%',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ 
                position: 'absolute', width: '100%', height: '100%', 
                background: `radial-gradient(circle, ${accentColor || '#3b82f6'}44 0%, transparent 70%)` 
            }} />
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: accentColor || '#3b82f6', zIndex: 10 }}>
                {title || "Yükleniyor..."}
            </h1>
            <p style={{ fontSize: '40px', zIndex: 10, marginTop: '20px', color: '#eee' }}>
                {storyline.length > 0 ? storyline[0] : sub}
            </p>
        </div>
    );
};

/**
 * 2. ANA SİTE ARAYÜZÜ
 */
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState<any>(null);

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

            // Arka planda GitHub Action tetikleme
            fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });

            setStatus('success');
        } catch (err) { setStatus('error'); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL */}
            <div style={{ width: '400px', padding: '40px', borderRight: '2px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee', marginBottom: '20px' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '15px', padding: '15px', border: '1px solid #333' }} 
                    placeholder="Komutunuzu buraya girin..." 
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '20px', background: '#2563eb', color: '#fff', borderRadius: '12px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                >
                    {status === 'processing' ? 'Hazırlanıyor...' : 'İçeriği Oluştur ve Oynat'}
                </button>
                <div style={{ marginTop: '20px' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
                        <strong>X:</strong> <p>{outputs?.twitter || "..."}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: GERÇEK VİDEO ÖNİZLEME */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '360px', height: '640px', border: '12px solid #1a1a1a', borderRadius: '50px', overflow: 'hidden' }}>
                    {status === 'success' && outputs ? (
                        <Player
                            component={VideoLayout} // KRİTİK: Buraya sadece video tasarımını veriyoruz, tüm sistemi değil!
                            durationInFrames={300}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            fps={30}
                            style={{ width: '100%', height: '100%' }}
                            autoPlay
                            loop
                            inputProps={{
                                title: outputs.videoTitle,
                                sub: outputs.videoSub,
                                accentColor: outputs.videoColor,
                                storyline: outputs.storyline
                            }}
                        />
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '80%' }}>Video burada canlı görünecek.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * 3. KAYIT VE GİRİŞ NOKTASI
 */
export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition 
                id="MyVideo" 
                component={VideoLayout} 
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
