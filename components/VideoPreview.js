import { Player } from "@remotion/player";
import { MyVideo } from "./MyVideo";

export default function VideoPreview({ videoProps }) {
    if (!videoProps) return null;
    return (
        <div style={{ width: 300, height: 533, border: '5px solid #333', borderRadius: 20, overflow: 'hidden' }}>
            <Player
                component={MyVideo}
                inputProps={videoProps}
                durationInFrames={300}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{ width: '100%', height: '100%' }}
                controls
            />
        </div>
    );
}
