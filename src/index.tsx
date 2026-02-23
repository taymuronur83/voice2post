import React, { useState, useEffect } from 'react';
import { registerRoot } from 'remotion';
import { Player } from '@remotion/player'; 

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
            flex: 1, 
            backgroundColor: '#000', 
            color: '#fff', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '60px', 
            textAlign: 'center', 
            fontFamily: 'sans-serif', 
            position: 'relative', 
            overflow: 'hidden', 
            width: '100%', 
            height: '100%' 
        }}>
            {/* Arka plan ışığı */}
            <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)` 
            }} />
            
            <h1 style={{ 
                fontSize: '80px', 
                fontWeight: 'bold', 
                color: accentColor, 
                zIndex: 10, 
                marginBottom: '20px',
                textShadow: '0 0 15px rgba(0,0,0,0.5)'
            }}>{title}</h1>
            
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
                <p style={{ fontSize: '42px', fontWeight: '500', color: '#eee', lineHeight: '1.4' }}>
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
        twitter: '', 
        linkedin: '', 
        videoTitle: '', 
        videoSub: '', 
        videoColor: '#3b82f6', 
        storyline: [] as string[]
    });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen bir komut girin!");
        
        setStatus('processing');
        
        try {
            // Vercel üzerindeki backend API'sine istek atıyoruz.
            // API Key backend'de (process.env.ANTHROPIC_API_KEY) olduğu için güvenlidir.
            const response = await fetch('/api/generate', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt: userInput }) 
            });
            
            if (!response.ok) throw new Error("API hatası oluştu.");
            
            const data = await response.json();
            
            // AI'dan gelen verileri kaydediyoruz
            setOutputs({ 
                twitter: data.twitter || '', 
                linkedin: data.linkedin || '', 
                videoTitle: data.video_script?.title || 'Başarılı!', 
                videoSub: data.video_script?.sub || '', 
                videoColor: data.video_script?.accentColor || '#3b82f6', 
                storyline: data.video_script?.storyline || []
            });

            // OTOMATİK OYNATMA: Başarılı olduğu an Player aktif olur, MP4 butonuna GEREK KALMAZ.
            setStatus('success');

            // Arka planda GitHub Actions render işlemini başlatır (dosya depoda oluşsun diye)
            fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });

        } catch (err) { 
            console.error("Hata:", err);
            setStatus('error'); 
            alert("Bir hata oluştu, lütfen API anahtarını ve bağlantıları kontrol et.");
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL TARAF: KOMUT GİRİŞİ */}
            <div style={{ flex: 1, padding: '40px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
                <h2 style={{ color: '#00acee', marginBottom: '20px', fontSize: '28px' }}>Voice2Post AI</h2>
                
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ 
                        width: '100%', height: '150px', background: '#111', color: '#fff', 
                        borderRadius: '15px', padding: '20px', border: '1px solid #333', fontSize: '18px', outline: 'none' 
                    }} 
                    placeholder="Komutunuzu buraya yazın..." 
                />
                
                <button 
                    onClick={handleGenerate} 
                    style={{ 
                        padding: '20px', background: '#2563eb', color: '#fff', borderRadius: '12px', 
                        marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '20px' 
                    }}
                >
                    {status === 'processing' ? 'Claude Düşünüyor...' : 'İçeriği Üret ve Oynat'}
                </button>
                
                <div style={{ marginTop: '30px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #222' }}>
                        <strong style={{ color: '#00acee' }}>X (Twitter):</strong>
                        <p style={{ marginTop: '10px', fontSize: '16px', lineHeight: '1.5' }}>{outputs.twitter || '...'}</p>
                    </div>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' }}>
                        <strong style={{ color: '#00acee' }}>LinkedIn:</strong>
                        <p style={{ marginTop: '10px', fontSize: '16px', lineHeight: '1.5' }}>{outputs.linkedin || '...'}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ TARAF: OTOMATİK DİKEY VİDEO */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ 
                    width: '360px', height: '640px', border: '12px solid #1a1a1a', 
                    borderRadius: '50px', overflow: 'hidden', position: 'relative', 
                    boxShadow: '0 25px 60px rgba(0,0,0,0.9)', background: '#000' 
                }}>
                    {status === 'success' ? (
                        <Player
                            component={SocialVideoContent}
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
                        <div style={{ 
                            color: '#444', textAlign: 'center', display: 'flex', 
                            flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '40px' 
                        }}>
                            {status === 'processing' ? (
                                <div style={{ color: '#2563eb', fontSize: '20px' }}>Video Oluşturuluyor...</div>
                            ) : (
                                "Oluştur butonuna bastığınızda video burada otomatik oynayacak."
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RemotionRoot: React.FC = () => (
    <MainSocialSystem />
);

registerRoot(RemotionRoot);
