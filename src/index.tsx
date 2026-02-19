import React, { useState } from 'react';
import { registerRoot, Composition, useCurrentFrame, interpolate } from 'remotion';

// --- VİDEO İÇERİĞİ (Claude'dan gelen kurguyu canlandıran kısım) ---
const SocialVideoContent = ({ 
    title, 
    sub, 
    accentColor 
}: { 
    title: string; 
    sub: string; 
    accentColor: string; 
}) => {
    const frame = useCurrentFrame();
    
    // Animasyonlar: Giriş efekti ve sürekli nabız efekti
    const opacity = interpolate(frame, [0, 20], [0, 1]);
    const scale = 1 + Math.sin(frame / 12) * 0.04;

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
            overflow: 'hidden'
        }}>
            {/* Arka Plan Efekti (Claude'un seçtiği renge göre parlar) */}
            <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
                transform: `scale(${1 + Math.sin(frame/20)*0.1})`,
                zIndex: 0
            }} />

            {/* Ana Başlık (Claude'un video_script.text verisi) */}
            <h1 style={{ 
                fontSize: '90px', 
                fontWeight: 'bold',
                transform: `scale(${scale})`, 
                opacity,
                zIndex: 1,
                marginBottom: '20px',
                lineHeight: '1.1'
            }}>
                {title || "Yükleniyor..."}
            </h1>

            {/* Alt Metin (Claude'un kurguladığı tema metni) */}
            <p style={{ 
                fontSize: '45px', 
                color: accentColor || '#3b82f6', 
                opacity, 
                zIndex: 1,
                fontWeight: '500'
            }}>
                {sub}
            </p>
        </div>
    );
};

// --- ANA ARAYÜZ (Kullanıcı Paneli ve Önizleme) ---
const MainSocialSystem = () => {
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState('idle');
    // Yeni API yapısına göre state güncellendi
    const [outputs, setOutputs] = useState({ 
        twitter: '', 
        linkedin: '', 
        videoTitle: '', 
        videoSub: '',
        videoColor: '#3b82f6'
    });

    const handleGenerate = async () => {
        if (!userInput) return alert("Lütfen bir komut girin!");
        setStatus('processing');
        try {
            // api/generate.js dosyasına istek atar
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            
            const data = await response.json();

            // API'den gelen karma veriyi (OpenAI + Claude) state'e dağıtıyoruz
            setOutputs({
                twitter: data.twitter,
                linkedin: data.linkedin,
                videoTitle: data.video_script.text,
                videoSub: data.video_script.theme.toUpperCase(), // Tema bilgisini alt metin yapıyoruz
                videoColor: data.video_script.accentColor
            });
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            
            {/* SOL PANEL: OpenAI Sosyal Medya Metinleri */}
            <div style={{ flex: 1, padding: '30px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#00acee', marginBottom: '15px' }}>OpenAI Metin Üretici</h2>
                <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Sosyal medya isteğinizi buraya yazın veya seslendirin..."
                    style={{ width: '100%', height: '150px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '10px', padding: '15px', outline: 'none' }}
                />
                <button 
                    onClick={handleGenerate} 
                    style={{ padding: '15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' }}
                >
                    {status === 'processing' ? 'Yapay Zeka Hazırlıyor...' : 'İçerikleri Oluştur'}
                </button>

                <div style={{ marginTop: '25px', spaceY: '15px' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222', marginBottom: '10px' }}>
                        <strong style={{ color: '#1da1f2' }}>Twitter (X):</strong> 
                        <p style={{ marginTop: '5px', fontSize: '14px' }}>{outputs.twitter || "..."}</p>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <strong style={{ color: '#0a66c2' }}>LinkedIn:</strong> 
                        <p style={{ marginTop: '5px', fontSize: '14px' }}>{outputs.linkedin || "..."}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: Claude & Remotion Video Önizleme */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <h2 style={{ marginBottom: '20px', color: '#d97706' }}>Claude Video Tasarımı</h2>
                <div style={{ 
                    width: '320px', 
                    height: '568px', 
                    border: '8px solid #1a1a1a', 
                    borderRadius: '40px', 
                    overflow: 'hidden', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    background: '#000'
                }}>
                    {status === 'success' ? (
                        /* Canlı Render Alanı */
                        <div style={{ width: '100%', height: '100%' }}>
                            <SocialVideoContent 
                                title={outputs.videoTitle} 
                                sub={outputs.videoSub} 
                                accentColor={outputs.videoColor} 
                            />
                        </div>
                    ) : (
                        <div style={{ color: '#444', textAlign: 'center', marginTop: '70%', padding: '20px' }}>
                            <i style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🎬</i>
                            {status === 'processing' ? 'Claude kurgu yapıyor...' : 'Komut verdiğinizde video burada belirecek'}
                        </div>
                    )}
                </div>

                {/* VERCEL RENDER MOTORU İÇİN KAYIT (ID Çakışmasını Önler) */}
                <div style={{ display: 'none' }}>
                    <Composition
                        id="MyVideo" 
                        component={SocialVideoContent}
                        durationInFrames={150}
                        fps={30}
                        width={1080}
                        height={1920}
                        defaultProps={{ 
                            title: "Hazırlanıyor...", 
                            sub: "AI", 
                            accentColor: "#3b82f6" 
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

registerRoot(MainSocialSystem);
