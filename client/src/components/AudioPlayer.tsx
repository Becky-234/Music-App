import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync the HTML audio element with Zustand state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Playback error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  const API_BASE_URL = 'http://localhost:4000';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#18181b] border-t border-gray-800 p-4 flex items-center justify-between">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
          ♪
        </div>
        <div className="truncate">
          <p className="text-sm font-bold truncate">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <div className="flex items-center gap-4">
          <button onClick={playPrevious} className="text-gray-400 hover:text-white">⏮</button>
          <button 
            onClick={togglePlay} 
            className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={playNext} className="text-gray-400 hover:text-white">⏭</button>
        </div>
        {/* Hidden Audio Tag */}
        <audio
          ref={audioRef}
          src={`${API_BASE_URL}${currentTrack.audioUrl}`}
          onEnded={playNext}
        />
      </div>

      {/* Empty space for visual balance */}
      <div className="w-1/3 flex justify-end">
        {/* Volume slider could go here later */}
      </div>
    </div>
  );
}