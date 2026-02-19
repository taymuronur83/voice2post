import { registerRoot, Composition, Audio, AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, Sequence } from 'remotion';
import React from 'react';

// --- CLAUDE'UN MEDYA KÜTÜPHANESİ (KONUYA ÖZEL) ---
const getVisualsByTopic = (topic: string) => {
  const library: Record<string, { bg: string; music: string; accentColor: string }> = {
    ekonomi: {
      bg: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      accentColor: "#00ff88"
    },
    motivasyon: {
      bg: "https://images.unsplash.com/photo-1494173853739-c21f58b16055?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
      accentColor: "#ffcc00"
    },
    teknoloji: {
      bg: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      accentColor: "#00d4ff"
    }
  };
  return library[topic] || library.teknoloji;
};

// --- VİDEO BİLEŞENİ ---
const SocialVideo: React.FC<{ topic: string; caption: string }> = ({ topic, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { bg, music, accentColor } = getVisualsByTopic(topic);

  // Arka plan hareket efekti
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.2]);
  // Yazı giriş animasyonu
  const opacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [10, 30], [40, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
      {/* Arka Plan */}
      <AbsoluteFill>
        <Img 
          src={bg} 
          style={{ 
            width: '100%', height: '100%', objectFit: 'cover', 
            transform: `scale(${scale})`, opacity: 0.5 
          }} 
        />
      </AbsoluteFill>

      {/* Claude Tasarımı: Metin Kutusu */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
        <div style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          color: 'white',
          fontSize: '72px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1.3,
          padding: '40px',
          borderRadius: '30px',
          borderLeft: `15px solid ${accentColor}`,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          {caption}
        </div>
      </AbsoluteFill>

      <Audio src={music} />
    </AbsoluteFill>
  );
};

// --- KAYIT NOKTASI ---
registerRoot(() => {
  // KURAL: 8-30 Saniye arası dinamik süre (Örn: 15 saniye)
  const durationSeconds = 15; 
  const fps = 30;

  return (
    <Composition
      id="MyVideo"
      component={SocialVideo}
      durationInFrames={durationSeconds * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        topic: "motivasyon", // Claude bu konuya bakıp tasarımı değiştirir
        caption: "Başarı, her gün tekrarlanan küçük disiplinlerin toplamıdır." // OpenAI'dan gelen içerik
      }}
    />
  );
});
