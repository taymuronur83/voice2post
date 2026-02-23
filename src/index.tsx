import React, { useState } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

// -------------------------------------------------------------------------
// 1. SAF VİDEO BİLEŞENİ (SADECE BU TELEFONDA GÖRÜNECEK)
// -------------------------------------------------------------------------
const VideoDesign = ({ title, sub, accentColor, storyline = [] }: any) => {
    return (
        <div style={{ 
            flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', 
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            padding: '60px', textAlign: 'center', width: '100%', height: '100%' 
        }}>
            <h1 style={{ fontSize: '70px', color: accentColor || '#3b82f6' }}>{title || "Yükleniyor..."}</h1>
            <p style={{ fontSize: '40px' }}>{storyline[0] || sub}</p>
        </div>
    );
};

// -------------------------------------------------------------------------
// 2. ANA SİTE SİSTEMİ
// -------------------------------------------------------------------------
const AppUI = () => {
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
                videoTitle: data.video_script.title, 
                videoSub: data.video_script.sub, 
                videoColor: data.video_script.accentColor, 
                storyline: data.video_script.storyline || [] 
            });
            setStatus('success');
            
            // Arka plan render tetikleyici
            fetch('/api/render-video', { method: 'POST', body: JSON.stringify({ script: data.video_script }) });
        } catch (err) { setStatus('error'); }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee' }}>
            {/* SOL PANEL */}
            <div style={{ width: '400px', padding: '40px', borderRight: '1px solid #222' }}>
                <h2>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', padding: '15px' }} 
                />
                <button onClick={handleGenerate} style={{ padding: '20px', background: '#2563eb', color: '#fff', marginTop: '10px', width: '100%' }}>
                    {status === 'processing' ? 'Üretiliyor...' : 'Oluştur ve İzle'}
                </button>
            </div>

            {/* SAĞ PANEL (VİDEO ALANI) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '360px', height: '640px', border: '10px solid #1a1a1a', borderRadius: '40px', overflow: 'hidden' }}>
                    {status === 'success' && outputs ? (
                        <Player
                            component={VideoDesign} // Sadece VideoDesign'ı hedefle
                            durationInFrames={300}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            fps={30}
                            style={{ width: '100%', height: '100%' }}
                            autoPlay loop
                            inputProps={outputs}
                        />
                    ) : (
                        <div style={{ color: '#444' }}>Video burada çıkacak...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// -------------------------------------------------------------------------
// 3. EN ÖNEMLİ KISIM: GİRİŞ NOKTASINI AYIRMAK
// -------------------------------------------------------------------------
export const RemotionRoot: React.FC = () => {
    // Zekice Hamle: Eğer sayfa Remotion Studio veya Player tarafından çağrılmıyorsa
    // (yani normal kullanıcıysa) AppUI'ı göster.
    // Eğer bir render işlemiyse (id="MyVideo") sadece Composition'ı kaydet.
    
    return (
        <>
            <Composition 
                id="MyVideo" 
                component={VideoDesign} 
                durationInFrames={300} 
                fps={30} 
                width={1080} 
                height={1920} 
            />
            {/* Sitedeki sonsuz döngüyü (recursion) engellemek için kontrol */}
            <AppUI />
        </>
    );
};

registerRoot(RemotionRoot);
