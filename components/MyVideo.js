import { AbsoluteFill, useVideoConfig, Audio, Img, interpolate, spring, useCurrentFrame, getInputProps } from 'remotion';
import React from 'react';

export const MyVideo = () => {
    // 1. VERİ YAKALAMA: Vercel/HTML tarafından gelen tüm paketi alıyoruz
    // Claude'dan gelen "animation" objesini de buraya ekliyoruz
    const { text, backgroundUrl, accentColor, audioUrl, animation } = getInputProps();
    
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Claude'dan gelen animasyon ayarları (Yoksa varsayılan değerleri kullanır)
    const config = animation || { shakeIntensity: 0, zoomScale: 1.15, textSpeed: 1 };

    // 2. ANİMASYONLAR
    // Metnin girişte yaylanarak gelmesi
    const entryOpacity = spring({
        frame,
        fps,
        config: { damping: 200 },
    });

    // ARKA PLAN ZOOM: Claude'un gönderdiği zoomScale değerine göre dinamikleşti
    const scale = interpolate(frame, [0, 300], [1, config.zoomScale || 1.15]);

    // SARSINTI EFEKTİ (Putin gibi konularda Claude burayı artıracaktır)
    const shake = Math.sin(frame * (config.textSpeed || 1)) * (config.shakeIntensity || 0);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            
            {/* 3. ARKA PLAN GÖRSELİ */}
            <AbsoluteFill style={{ transform: `scale(${scale})` }}>
                <Img 
                    src={backgroundUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80"} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        opacity: 0.5 
                    }} 
                />
            </AbsoluteFill>

            {/* 4. RENK VURGUSU (Overlay) */}
            <AbsoluteFill style={{ 
                background: `linear-gradient(to top, ${accentColor || '#3b82f6'}aa, transparent 70%)`,
                mixBlendMode: 'multiply'
            }} />

            {/* 5. METİN KATMANI */}
            <AbsoluteFill style={{ 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '0 80px',
                opacity: entryOpacity,
                // Sarsıntı efekti transform'a eklendi
                transform: `translate(${shake}px, ${shake}px)`
            }}>
                {/* Dinamik Renkli Çizgi */}
                <div style={{
                    width: '120px',
                    height: '10px',
                    backgroundColor: accentColor || '#3b82f6',
                    marginBottom: '40px',
                    borderRadius: '20px',
                    boxShadow: `0 0 20px ${accentColor}66`
                }} />

                <h1 style={{
                    color: 'white',
                    fontSize: '80px',
                    fontWeight: '900',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    lineHeight: '1.2',
                    margin: 0,
                    letterSpacing: '-2px'
                }}>
                    {text || "İçerik Oluşturuluyor..."}
                </h1>
            </AbsoluteFill>

            {/* 6. MÜZİK */}
            {audioUrl && <Audio src={audioUrl} />}
            
        </AbsoluteFill>
    );
};
