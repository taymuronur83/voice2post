import React, { useState, useEffect } from 'react';
import { registerRoot, Composition } from 'remotion';
import { Player } from '@remotion/player';

/** * KURAL: Mevcut sistem kodun ve Claude entegrasyonun korunmuştur.
 * Sadece videonun "gösterilme" mantığı MP4'ten Canlı Player'a çevrilmiştir.
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
            padding: '60px', textAlign: 'center', width: '100%', height: '100%',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ 
                position: 'absolute', width: '100%', height: '100%', 
                background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)` 
            }} />
            <h1 style={{ fontSize: '70px', fontWeight: 'bold', color: accentColor, zIndex: 10, textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                {title}
            </h1>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
                <p style={{ fontSize: '40px', fontWeight: '500', color: '#eee', lineHeight: '1.4' }}>
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
            // 1. Claude API'den verileri çekiyoruz
            const response = await fetch('/api/generate', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt: userInput }) 
            });
            
            const data = await response.json();
            
            // 2. Verileri State'e kaydediyoruz
            const newOutputs = { 
                twitter: data.twitter, 
                linkedin: data.linkedin, 
                videoTitle: data.video_script.title, 
                videoSub: data.video_script.sub, 
                videoColor: data.video_script.accentColor, 
                storyline: data.video_script.storyline || [] 
            };
            
            setOutputs(newOutputs);
            setStatus('success'); // Player bu aşamada videoyu anında oynatır

            // 3. Arka planda MP4 render işlemini tetikliyoruz (Yine de oluşsun diye)
            fetch('/api/render-video', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ script: data.video_script }) 
            });

        } catch (err) { 
            console.error("Sistem Hatası:", err);
            setStatus('error'); 
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', overflow: 'hidden' }}>
            {/* SOL PANEL: AYARLAR VE ÇIKTILAR */}
            <div style={{ flex: 1, padding: '40px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
                <h2 style={{ color: '#00acee', marginBottom: '20px', fontSize: '28px' }}>Voice2Post AI</h2>
                
                <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    style={{ 
                        width: '100%', height: '150px', background: '#111', color: '#fff', 
                        borderRadius: '15px', padding: '20px', border: '1px solid #333', fontSize: '18px'
                    }} 
                    placeholder="Komutunuzu buraya girin..." 
                />
                
                <button 
                    onClick={handleGenerate} 
                    style={{ 
                        padding: '20px', background: '#2563eb', color: '#fff', borderRadius: '12px', 
                        marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '20px' 
                    }}
                >
                    {status === 'processing' ? 'Claude Düşünüyor...' : 'İçeriği Oluştur ve Oynat'}
                </button>
                
                <div style={{ marginTop: '30px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #222' }}>
                        <strong style={{ color: '#00acee' }}>X (Twitter):</strong>
                        <p style={{ marginTop: '10px' }}>{outputs.twitter || '...'}</p>
                    </div>
                    <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' }}>
                        <strong style={{ color: '#00acee' }}>LinkedIn:</strong>
                        <p style={{ marginTop: '10px' }}>{outputs.linkedin || '...'}</p>
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL: DİKEY VİDEO EKRANI (CANLI PLAYER) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
                <div style={{ 
                    width: '360px', height: '640px', border: '12px solid #1a1a1a', 
                    borderRadius: '50px', overflow: 'hidden', position: 'relative',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.9)'
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
                                <p style={{ fontSize: '20px', color: '#2563eb' }}>Video İnşa Ediliyor...</p>
                            ) : (
                                <p>Komutunuzdan sonra video burada anında oynayacak.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// REMOTION ROOT - SİSTEMİN KALBİ
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
