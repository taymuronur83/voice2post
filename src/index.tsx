import { registerRoot, Composition, Audio, AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import React from 'react';

// --- CLAUDE'UN KOMUT ANALİZ MERKEZİ ---
// Bu kısım siteden gelen komuta göre görsel ve müzik atmosferini belirler.
// Mevcut ekonomi, motivasyon ve teknoloji kategorileri aynen korunmuştur.
const analyzeCommand = (command: string) => {
  const cmd = command.toLowerCase();
  
  if (cmd.includes('ekonomi') || cmd.includes('para') || cmd.includes('borsa')) {
    return {
      bg: "https://images.unsplash.com/photo-1611974717482-480928d195f0?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      accent: "#00ff88"
    };
  }
  if (cmd.includes('motive') || cmd.includes('spor') || cmd.includes('başarı')) {
    return {
      bg: "https://images.unsplash.com/photo-1494173853739-c21f58b16055?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
      accent: "#ffcc00"
    };
  }
  // Varsayılan: Teknoloji/Modern (Claude Default Style) - Mevcut yapı korunmuştur.
  return {
    bg: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    accent: "#00d4ff"
  };
};

// --- VİDEO TASARIMI (EXPORT EDİLDİ: SİTEDE PLAYER İÇİN) ---
// Bu bileşen dikey (9:16) formatta sitendeki Player içinde doğrudan kullanılabilir.
// Tüm animasyon ve stil verileri korunmuştur.
export const ClaudeVideo: React.FC<{ command: string }> = ({ command }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const style = analyzeCommand(command);

  // Arka plan Ken Burns (yavaş zoom) efekti
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  // Yazı giriş animasyonu (Fade-in)
  const opacity = interpolate(frame, [0, 25], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
      {/* Dinamik Arka Plan - Orijinal hali korunmuştur */}
      <AbsoluteFill>
        <Img 
          src={style.bg} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transform: `scale(${scale})`, 
            opacity: 0.5 
          }} 
        />
      </AbsoluteFill>

      {/* Metin Alanı (9:16 dikey formatına uygun tasarlanmış) */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
        <div style={{
          opacity,
          color: 'white',
          fontSize: '60px',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '30px',
          borderLeft: `12px solid ${style.accent}`,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          textShadow: '0px 5px 15px rgba(0,0,0,0.5)'
        }}>
          {command.toUpperCase()}
        </div>
      </AbsoluteFill>

      {/* Konuya Uygun Müzik - Orijinal hali korunmuştur */}
      <Audio src={style.music} />
    </AbsoluteFill>
  );
};

// --- RENDER VE COMPOSITION AYARLARI ---
// 9:16 Dikey format ve 8-30 saniye kuralı burada tanımlıdır.
registerRoot(() => {
  // Siteden gelen sesin uzunluğuna göre bu süreyi 8-30 arası set edebilirsin.
  const durationInSeconds = 15; // 15 Saniye (Örnek)
  const fps = 30;

  return (
    <Composition
      id="MyVideo"
      component={ClaudeVideo}
      durationInFrames={durationInSeconds * fps}
      fps={fps}
      width={1080} // 9:16 dikey genişlik
      height={1920} // 9:16 dikey yükseklik
      defaultProps={{
        command: "Siteden gelen komut bekleniyor...", // Varsayılan metin
      }}
    />
  );
});
