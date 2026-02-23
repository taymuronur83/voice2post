import React, { useState } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

// ---------------------------------------------------------
// 1. SADECE VİDEONUN KENDİSİ (TELEFON EKRANINDA ÇIKACAK OLAN)
// ---------------------------------------------------------
export const MyVideoContent = ({ 
    title = "Başlık Bekleniyor", 
    sub = "Alt Başlık", 
    accentColor = "#3b82f6", 
    storyline = [] 
}: any) => {
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
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: accentColor, zIndex: 10 }}>{title}</h1>
            <p style={{ fontSize: '45px', zIndex: 10, marginTop: '30px', color: '#eee' }}>
                {storyline.length > 0 ? storyline[0] : sub}
            </p>
        </div>
    );
};

// ---------------------------------------------------------
// 2. ANA SİTE ARAYÜZÜ (SOL PANEL + SAĞ PANEL)
// ---------------------------------------------------------
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [outputs, setOutputs] = useState({ 
        twitter: '', linkedin: '', videoTitle: '', videoSub: '', videoColor: '#3b82f6', storyline: [] as string[] 
    });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen komut girin!");
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

            // Arka planda render tetikleyici
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
            <div style={{ width: '450px', padding: '40px', borderRight: '2px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee', marginBottom: '20px' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '15px', padding: '20px', border: '1px solid #333' }} 
                    placeholder="Komutunuzu buraya girin..." 
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '20px', background: '#2563eb', color: '#fff', borderRadius: '12px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                >
                    {status === 'processing' ? 'Claude İşliyor...' : 'İçeriği Oluştur ve Oynat'}
                </button>
                <div style={{ marginTop: '30px', overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '15px', marginBottom: '15px' }}>
                        <strong>X (Twitter):</strong>
                        <p style={{ marginTop: '10px', color: '#ccc' }}>{outputs.twitter}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: CANLI VİDEO ÖNİZLEME */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '360px', height: '640px', border: '12px solid #1a1a1a', borderRadius: '50px', overflow: 'hidden', position: 'relative' }}>
                    {status === 'success' ? (
                        <Player
                            component={MyVideoContent} // KRİTİK: Buraya SADECE video bileşenini veriyoruz
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
                        <div style={{ color: '#444', textAlign: 'center', display: 'flex', alignItems: 'center', height: '100%', padding: '20px' }}>
                            {status === 'processing' ? 'Dikey ekran hazırlanıyor...' : 'Komut sonrası video burada anında başlayacak.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------
// 3. REMOTION KAYIT NOKTASI
// ---------------------------------------------------------
export const RemotionRoot: React.FC = () => {
    // URL'de "composition" araması yapılıyorsa (Render işlemiyse) sadece videoyu göster
    // Değilse (Sitedeyse) ana sistemi göster. Bu iç içe geçmeyi engeller.
    return (
        <>
            <Composition 
                id="MyVideo" 
                component={MyVideoContent} 
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
