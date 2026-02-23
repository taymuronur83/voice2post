import React, { useState, useEffect } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player'; // Dosya yüklemesini beklemeden oynatan teknoloji

// Gemini API Key - Mevcut şifrelemene dokunulmadı
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
    // Bu kısım videonun içindeki animasyon tasarımını korur
    return (
        <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)` }} />
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: accentColor, zIndex: 10, textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>{title}</h1>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
                <p style={{ fontSize: '45px', fontWeight: '500', color: '#eee' }}>{storyline[0] || sub}</p>
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
        
        setStatus('processing'); // İşlem başlıyor
        
        try {
            // 1. ADIM: AI İçeriği Üret (Metinler ve Video Tasarımı)
            const response = await fetch('/api/generate', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt: userInput, key: GEMINI_API_KEY }) 
            });
            const data = await response.json();
            
            // Verileri yerleştir
            setOutputs({ 
                twitter: data.twitter, 
                linkedin: data.linkedin, 
                videoTitle: data.video_script.title, 
                videoSub: data.video_script.sub, 
                videoColor: data.video_script.accentColor, 
                storyline: data.video_script.storyline || [], 
                animConfig: data.video_script.animation 
            });

            // 2. ADIM: OTOMATİK BAŞLATMA
            // MP4 butonuna basmana gerek kalmadan status'ü 'success' yapıyoruz.
            // Player teknolojisi 'success' olduğu an videoyu sağ tarafta başlatacak.
            setStatus('success');

            // 3. ADIM: Arka Planda Render (İndirmek istersen diye GitHub çalışsın)
            fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });

        } catch (err) { 
            console.error("Hata:", err);
            setStatus('error'); 
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL: Komut Girişi */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 100 }}>
                <h2 style={{ color: '#00acee', fontWeight: 'bold' }}>Voice2Post AI</h2>
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #333', fontSize: '16px' }} 
                    placeholder="Sesli veya yazılı komutunuzu buraya bırakın..." 
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '18px', background: '#2563eb', color: '#fff', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '18px' }}
                >
                    {status === 'processing' ? 'AI Hazırlıyor...' : 'İçeriği Oluştur ve Oynat'}
                </button>
                
                <div style={{ marginTop: '20px', overflowY: 'auto' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #222' }}>
                        <strong style={{ color: '#00acee' }}>X (Twitter):</strong>
                        <p style={{ marginTop: '5px' }}>{outputs.twitter}</p>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <strong style={{ color: '#00acee' }}>LinkedIn:</strong>
                        <p style={{ marginTop: '5px' }}>{outputs.linkedin}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: OTOMATİK DİKEY EKRAN */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', position: 'relative' }}>
                <div style={{ width: '340px', height: '600px', border: '10px solid #1a1a1a', borderRadius: '45px', overflow: 'hidden', position: 'relative', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
                    {status === 'success' ? (
                        <Player
                            component={SocialVideoContent}
                            durationInFrames={450}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            fps={30}
                            style={{ width: '100%', height: '100%' }}
                            controls={false} // Gereksiz butonları kaldır, otomatik aksın
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
                        <div style={{ color: '#555', textAlign: 'center', marginTop: '80%', padding: '20px', fontFamily: 'sans-serif' }}>
                            {status === 'processing' ? (
                                <div className="loader">AI Tasarlıyor...</div>
                            ) : (
                                "Komutunuzdan sonra video burada otomatik başlayacak."
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Kayıt İşlemi
export const RemotionRoot: React.FC = () => (
    <MainSocialSystem />
);

registerRoot(RemotionRoot);
