import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const MyVideo = ({ scenes = [] }) => {
    const frame = useCurrentFrame();
    return (
        <AbsoluteFill style={{ backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {scenes.map((scene, index) => {
                const start = scenes.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
                const end = start + scene.duration;
                if (frame >= start && frame < end) {
                    return (
                        <div key={index} style={{ color: scene.color || 'white', fontSize: 50, fontWeight: 'bold', textAlign: 'center' }}>
                            {scene.text}
                        </div>
                    );
                }
                return null;
            })}
        </AbsoluteFill>
    );
};
