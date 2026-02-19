import { AbsoluteFill, useVideoConfig, Audio, Img, interpolate, spring, useCurrentFrame, getInputProps } from 'remotion';
import React from 'react';

export const MyVideo = () => {
    // 1. VERİ YAKALAMA: Vercel/HTML tarafından gelen tüm paketi alıyoruz
    const { text, backgroundUrl, accentColor, audioUrl } = getInputProps();
    
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 2. ANİMASYONLAR
    // Metnin girişte yaylanarak gelmesi (Spring efekti)
    const opacity = spring({
        frame,
        fps,
        config: { damping: 200 },
    });

    // Arka planın sürekli yavaşça büyümesi (Ken Burns / Sinematik etki)
    const scale = interpolate(frame, [0, 300], [1, 1.15]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            
            {/* 3. ARKA PLAN GÖRSELİ */}
            {/* Claude'un seçtiği görseli arkaya döşer, hafifçe büyütür */}
            <AbsoluteFill style={{ transform: `scale(${scale})` }}>
                <Img 
                    src={backgroundUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80"} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        opacity: 0.5 // Yazıların okunması için görseli karartıyoruz
                    }} 
                />
            </AbsoluteFill>

            {/* 4. RENK VURGUSU (Overlay) */}
            {/* Gelen accentColor'ı kullanarak alt tarafa renkli bir hava katar */}
            <AbsoluteFill style={{ 
                background: `linear-gradient(to top, ${accentColor || '#3b82f6'}aa, transparent 70%)`,
                mixBlendMode: 'multiply'
            }} />

            {/* 5. METİN KATMANI */}
            <AbsoluteFill style={{ 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '0 80px',
                opacity: opacity 
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
            {/* Claude müzik linki gönderdiyse çalar */}
            {audioUrl && <Audio src={audioUrl} />}
            
        </AbsoluteFill>
    );
};
