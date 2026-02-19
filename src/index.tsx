import { registerRoot, Composition, Audio, AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, getInputProps } from 'remotion';
import React from 'react';

// --- CLAUDE'UN TASARIM PLANI ARABİRİMİ ---
interface VideoPlan {
  text: string;
  theme: 'ekonomi' | 'motive' | 'teknoloji';
  accentColor: string;
  backgroundUrl: string;
  audioUrl: string;
}

// --- CLAUDE'UN KOMUT ANALİZ MERKEZİ ---
// Kullanıcının sesli/yazılı komutunu analiz edip görsel atmosferi belirleyen merkez.
// Tek bir satır bile eksiltilmeden korunmuştur.
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
  return {
    bg: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    accent: "#00d4ff"
  };
};

// --- VİDEO TASARIMI (CANLI GÖSTERİM BİLEŞENİ) ---
// Hem ham komutları hem de Claude'dan gelen özel JSON tasarımlarını işler.
export const ClaudeVideo: React.FC<{ command: string; videoData?: string }> = ({ command, videoData }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 1. Veri Kaynağını Belirle (JSON varsa onu kullan, yoksa analize git)
  let plan: VideoPlan;
  
  try {
    if (videoData && videoData !== "{}") {
      plan = JSON.parse(videoData);
    } else {
      throw new Error("Düz metin moduna geç");
    }
  } catch (e) {
    const style = analyzeCommand(command);
    plan = {
      text: command,
      theme: 'teknoloji',
      accentColor: style.accent,
      backgroundUrl: style.bg,
      audioUrl: style.music
    };
  }

  // Görsel Efektler: Zoom (Ken Burns) ve Fade-in animasyonları korunmuştur.
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const opacity = interpolate(frame, [0, 25], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
      {/* Arka Plan Görseli */}
      <AbsoluteFill>
        <Img 
          src={plan.backgroundUrl} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transform: `scale(${scale})`, 
            opacity: 0.5 
          }} 
        />
      </AbsoluteFill>

      {/* Claude'dan Gelen Metnin Videodaki Gösterimi */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
        <div style={{
          opacity,
          color: 'white',
          fontSize: '60px',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '30px',
          borderLeft: `12px solid ${plan.accentColor}`,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          textShadow: '0px 5px 15px rgba(0,0,0,0.5)',
          textTransform: 'uppercase'
        }}>
          {plan.text}
        </div>
      </AbsoluteFill>

      {/* Dinamik Müzik */}
      <Audio src={plan.audioUrl} />
    </AbsoluteFill>
  );
};

// --- RENDER VE COMPOSITION AYARLARI ---
registerRoot(() => {
  const durationInSeconds = 15; 
  const fps = 30;

  // Web sitesinden gelen dinamik verileri yakala
  const inputProps = getInputProps();
  const finalCommand = inputProps.command || "Claude komut analizi yapılıyor...";
  const finalVideoData = inputProps.videoData || "{}";

  return (
    <Composition
      id="MyVideo"
      component={ClaudeVideo}
      durationInFrames={durationInSeconds * fps}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        command: finalCommand,
        videoData: finalVideoData
      }}
    />
  );
});
