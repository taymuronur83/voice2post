import { registerRoot, Composition } from 'remotion';
import React from 'react';

const MyVideo: React.FC = () => {
  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: '#1a1a1a', 
      color: '#00d4ff', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '80px',
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      border: '20px solid #333'
    }}>
      <div style={{ marginBottom: '20px' }}>🎙️ Voice2Post</div>
      <div style={{ fontSize: '40px', color: '#ccc' }}>Video Hazırlanıyor...</div>
    </div>
  );
};

registerRoot(() => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={150} // 5 saniyelik video
      fps={30}
      width={1080}
      height={1920}
    />
  );
});
