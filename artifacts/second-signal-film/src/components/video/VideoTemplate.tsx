import { useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { VideoCanvas, type VideoAspectRatio, useVideoPlayer, VideoPausedContext } from '@/lib/video';
import { AnimatePresence } from 'framer-motion';
import { HookScene } from './scenes/HookScene';
import { SignalScene } from './scenes/SignalScene';
import { WaysScene } from './scenes/WaysScene';
import { CommunityScene } from './scenes/CommunityScene';
import { MatchScene } from './scenes/MatchScene';
import { TaglineScene } from './scenes/TaglineScene';
import { Grain } from './shared';

export const SCENE_DURATIONS = {
  hook: 5250,
  signal: 5200,
  ways: 6400,
  community: 6650,
  match: 7150,
  tagline: 5350,
};

const SCENE_COMPONENTS: Record<string, ComponentType> = {
  hook: HookScene,
  signal: SignalScene,
  ways: WaysScene,
  community: CommunityScene,
  match: MatchScene,
  tagline: TaglineScene,
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let ms = 0;
  for (const [k, v] of Object.entries(SCENE_DURATIONS)) { out[k] = ms / 1000; ms += v; }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop, paused });
  useEffect(() => { onSceneChange?.(currentSceneKey); }, [currentSceneKey, onSceneChange]);
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSceneKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    if (paused) { audio.pause(); return; }
    if (lastSceneKeyRef.current !== currentSceneKey) {
      lastSceneKeyRef.current = currentSceneKey;
      const target = SCENE_START_SEC[baseSceneKey] ?? 0;
      if (Math.abs(audio.currentTime - target) > AUDIO_SEEK_EPSILON_SEC) audio.currentTime = target;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted, paused]);

  return (
    <VideoPausedContext.Provider value={paused}>
      <VideoCanvas aspectRatio={VIDEO_ASPECT_RATIO} style={{ backgroundColor: '#F8F7F2' }}>
        <AnimatePresence mode="sync">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
        <Grain />
        <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`} preload="auto" autoPlay muted={muted} />
      </VideoCanvas>
    </VideoPausedContext.Provider>
  );
}
