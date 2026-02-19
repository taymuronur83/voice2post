import { registerRoot, Composition } from 'remotion';
import React from 'react';

// Video Bileşeni
const MyVideo: React.FC = () => {
  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: 'black', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '60px' 
    }}>
      Render Basarili!
    </div>
  );
};

// Kayıt İşlemi
registerRoot(() => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={60}
      fps={30}
      width={1080}
      height={1920}
    />
  );
});
