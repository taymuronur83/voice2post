import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';

// Ana Video Bileşeni
const MyVideo: React.FC = () => {
    return (
        <div style={{ 
            flex: 1, 
            backgroundColor: 'white', 
            justifyContent: 'center', 
            alignItems: 'center', 
            display: 'flex', 
            fontSize: '50px' 
        }}>
            Voice2Post Otomatik Render Başarılı!
        </div>
    );
};

// Kayıt İşlemi
registerRoot(() => {
    return (
        <Composition
            id="MyVideo"
            component={MyVideo}
            durationInFrames={150}
            fps={30}
            width={1080}
            height={1920}
        />
    );
});
