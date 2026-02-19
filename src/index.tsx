import { registerRoot, Composition, Audio, AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import React from 'react';

// --- KONUYA GÖRE VARLIK SEÇİCİ (CLAUDE MANTIĞI) ---
const getAssetsByTopic = (topic: string) => {
  const assets: Record<string, { bg: string; music: string }> = {
    teknoloji: {
      bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    doga: {
      bg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    is_dunyasi: {
      bg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&q=80",
      music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
  };
  // Eğer konu eşleşmezse varsayılan (default) varlıklar
  return assets[topic] || assets.teknoloji;
};

// --- ANA VİDEO BİLEŞENİ ---
const MyVideo: React.FC<{ topic: string; text: string }> = ({ topic, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { bg, music } = getAssetsByTopic(topic);

  // Arka plan için yavaş zoom efekti
  const scale = interpolate(frame, [0, 900], [1, 1.2]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Dinamik Arka Plan */}
      <AbsoluteFill>
        <Img 
          src={bg} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transform: `scale(${scale})`,
            opacity: 0.7 
          }} 
        />
      </AbsoluteFill>

      {/* Metin Alanı (OpenAI'dan gelen metin buraya basılacak) */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px',
        textAlign: 'center' 
      }}>
        <div style={{
          color: 'white',
          fontSize: '65px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          textShadow: '0px 10px 30px rgba(0,0,0,0.5)',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '20px',
          borderRadius: '20px'
        }}>
          {text}
        </div>
      </AbsoluteFill>

      {/* Dinamik Müzik */}
      <Audio src={music} />
    </AbsoluteFill>
  );
};

// --- KAYIT VE SÜRE AYARLARI ---
registerRoot(() => {
  // Kural: 8 - 30 saniye arası (Örnek: 15 saniye)
  const durationInSeconds = 15; 
  const fps = 30;

  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={durationInSeconds * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        topic: "teknoloji", // Claude buradan konuyu okuyup görsel seçecek
        text: "Geleceğin teknolojisi bugün burada şekilleniyor." // OpenAI'dan gelen metin
      }}
    />
  );
});
