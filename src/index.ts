import {registerRoot} from 'remotion';
import {Composition} from 'remotion';
import React from 'react';

// Basit bir test bileşeni (Hata almamak için)
const MyVideo: React.FC = () => {
	return (
		<div style={{flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', display: 'flex', fontSize: '50px'}}>
			Voice2Post Otomatik Render Başarılı!
		</div>
	);
};

// Kayıt işlemi (Scripts içindeki "MyVideo" ismiyle aynı olmalı)
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
