import { registerRoot, Composition, Audio, AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import React from 'react';

// --- TİPLER ---
interface VideoProps {
    title: string;
    bgImage: string;
    audioUrl: string;
    durationInSeconds: number;
}

// --- ANA BİLEŞEN ---
const Voice2PostVideo: React.FC<VideoProps> = ({ title, bgImage, audioUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Hafif bir zoom efekti (Arka planın hareketli durması için)
    const scale = interpolate(frame, [0, 300], [1, 1.1]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* Arka Plan Görseli */}
            <AbsoluteFill>
                <Img 
                    src={bgImage} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transform: `scale(${scale})`,
                        opacity: 0.6
                    }} 
                />
            </AbsoluteFill>

            {/* İçerik Yazısı */}
            <AbsoluteFill style={{ 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '40px' 
            }}>
                <h1 style={{ 
                    color: 'white', 
                    fontSize: '70px', 
                    textAlign: 'center', 
                    fontFamily: 'sans-serif',
                    textShadow: '0px 5px 15px rgba(0,0,0,0.8)'
                }}>
                    {title}
                </h1>
            </AbsoluteFill>

            {/* Müzik/Ses Dosyası */}
            <Audio src={audioUrl} />
        </AbsoluteFill>
    );
};

// --- KAYIT VE AYARLAR ---
registerRoot(() => {
    // 8 ile 30 saniye arası kontrolü (Burada 15 saniye örnek verildi)
    const durationSeconds = 15; 
    const fps = 30;

    return (
        <Composition
            id="MyVideo"
            component={Voice2PostVideo}
            durationInFrames={durationSeconds * fps}
            fps={fps}
            width={1080}
            height={1920}
            defaultProps={{
                title: "Konuya Uygun Harika Başlık",
                bgImage: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=1080&q=80", // Örnek arka plan
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Örnek müzik
                durationInSeconds: durationSeconds
            }}
        />
    );
});
