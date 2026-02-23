import React, { useState } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

// ---------------------------------------------------------------------------------
// 1. VİDEO TASARIMI (Sadece bu kısım telefon ekranında (Player) görünecek)
// ---------------------------------------------------------------------------------
export const VideoElement = ({ title, sub, accentColor, storyline = [] }: any) => {
    return (
        <div style={{ 
            flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', 
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
            padding: '60px', textAlign: 'center', width: '100%', height: '100%',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ 
                position: 'absolute', width: '100%', height: '100%', 
                background: `radial-gradient(circle, ${accentColor || '#3b82f6'}44 0%, transparent 70%)` 
            }} />
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: accentColor || '#3b82f6', zIndex: 10 }}>
                {title || "AI Hazırlıyor..."}
            </h1>
            <p style={{ fontSize: '40px', zIndex: 10, marginTop: '30px', color: '#eee' }}>
                {storyline.length > 0 ? storyline[0] : sub}
            </p>
        </div>
    );
};

// ---------------------------------------------------------------------------------
// 2. ANA SİTE ARAYÜZÜ (Bu kısım dikey ekranın İÇİNDE ASLA görünmemeli)
// ---------------------------------------------------------------------------------
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
                videoTitle: data.video_script.title, 
                videoSub: data.video_script.sub, 
                videoColor: data.video_script.accentColor, 
                storyline: data.video_script.storyline || [] 
            });

            // GitHub Action tetikleme
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
            {/* SOL PANEL (Komut Girişi) */}
            <div style={{ width: '400px', padding: '40px', borderRight: '2px solid #222', display: 'flex', flexDirection: 'column' }}>
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
                <div style={{ marginTop: '20px', background: '#111', padding: '15px', borderRadius: '10px' }}>
                    <strong>Çıktı:</strong> <p style={{ fontSize: '14px', color: '#ccc' }}>{outputs?.twitter || "Bekleniyor..."}</p>
                </div>
            </div>

            {/* SAĞ PANEL: İŞTE BURASI DÜZELEN YER */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ width: '360px', height: '640px', border: '12px solid #1a1a1a', borderRadius: '50px', overflow: 'hidden', background: '#000' }}>
                    {status === 'success' && outputs ? (
                        <Player
                            // DİKKAT: Burada Player'a component olarak MainSocialSystem değil,
                            // SADECE VideoElement'i veriyoruz. Bu "site içinde site" hatasını bitirir.
                            component={VideoElement} 
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
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '80%' }}>Video bekleniyor...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------------
// 3. REMOTION GİRİŞ NOKTASI (BURASI DÖNGÜYÜ KIRAR)
// ---------------------------------------------------------------------------------
export const RemotionRoot: React.FC = () => {
    // Burası çok önemli: Remotion'ın render motoru bu fonksiyonu çalıştırdığında
    // hem Composition'ı kaydeder hem de MainSocialSystem'ı çağırır.
    // Biz Player'da SADECE VideoElement'i çağırarak döngüyü yukarıda kırmış olduk.
    return (
        <>
            <Composition 
                id="MyVideo" 
                component={VideoElement} 
                durationInFrames={300} 
                fps={30} 
                width={1080} 
                height={1920} 
            />
            {/* Tarayıcıda (Sitedeyken) ana arayüzü gösterir */}
            <MainSocialSystem />
        </>
    );
};

registerRoot(RemotionRoot);
