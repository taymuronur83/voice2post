import { registerRoot, Composition, Audio, AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import React from 'react';

// --- CLAUDE'UN KOMUT ANALİZ MERKEZİ ---
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
  // Varsayılan: Teknoloji/Modern
  return {
    bg: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    accent: "#00d4ff"
  };
};

// --- VİDEO TASARIMI ---
const ClaudeVideo: React.FC<{ command: string }> = ({ command }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const style = analyzeCommand(command);

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const opacity = interpolate(frame, [0, 25], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
      <AbsoluteFill>
        <Img 
          src={style.bg} 
          style={{ 
            width: '100%', height: '100%', objectFit: 'cover', 
            transform: `scale(${scale})`, opacity: 0.5 
          }} 
        />
      </AbsoluteFill>

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
          borderRadius: '15px'
        }}>
          {/* Burası siteden gelen komutun işlenmiş halini gösterir */}
          {command.toUpperCase()}
        </div>
      </AbsoluteFill>

      <Audio src={style.music} />
    </AbsoluteFill>
  );
};

// --- RENDER AYARLARI ---
registerRoot(() => {
  // Siteden gelen sesin uzunluğuna göre bu süreyi 8-30 arası set edebilirsin
  const durationInSeconds = 15; 
  const fps = 30;

  return (
    <Composition
      id="MyVideo"
      component={ClaudeVideo}
      durationInFrames={durationInSeconds * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        command: "Motivasyon dolu bir gün", // Siteden gelen ana komut buraya girecek
      }}
    />
  );
});
