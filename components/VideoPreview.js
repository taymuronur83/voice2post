import { Player } from "@remotion/player";
import { MyVideo } from "./MyVideo";
import { useEffect, useState } from "react";

export default function VideoPreview() {
    const [videoProps, setVideoProps] = useState(null);

    useEffect(() => {
        // 1. URL'den gelen verileri yakala
        const params = new URLSearchParams(window.location.search);
        const videoDataRaw = params.get("videoData");

        if (videoDataRaw) {
            try {
                // 2. Gelen string veriyi objeye dönüştür
                const decodedData = JSON.parse(decodeURIComponent(videoDataRaw));
                
                // 3. Remotion Player'ın anlayacağı formata çevir
                // MyVideo.js içinde bu isimleri kullanacağız: text, backgroundUrl, accentColor
                setVideoProps({
                    text: decodedData.text || "Başlık Hazırlanıyor...",
                    backgroundUrl: decodedData.backgroundUrl || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&q=80",
                    accentColor: decodedData.accentColor || "#3b82f6",
                    audioUrl: decodedData.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    theme: decodedData.theme || "teknoloji"
                });
            } catch (e) {
                console.error("Video verisi ayrıştırılamadı:", e);
            }
        }
    }, []);

    // Eğer veri henüz gelmediyse boş dönme, bir yükleme ekranı göster
    if (!videoProps) {
        return (
            <div style={{ 
                width: '100%', height: '100%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#000', color: '#fff', fontSize: '12px' 
            }}>
                Claude Verisi Bekleniyor...
            </div>
        );
    }

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            <Player
                component={MyVideo}
                inputProps={videoProps} // Artık içini doldurduğumuz obje gidiyor
                durationInFrames={300}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{ width: '100%', height: '100%' }}
                controls
                autoPlay
                loop
            />
        </div>
    );
}
