import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { AudioControls } from "@/components/AudioControls";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { LyricWord } from "@/lib/lyrics";
import { parseLyrics } from "@/lib/lyrics";
import lyricsData from "../../public/song/lyrics.json";

export const Route = createFileRoute("/")({
	component: LyricsPlayer,
});

function LyricsPlayer() {
	const audio = useAudioPlayer("/song/audio.mp3");

	const parsedLyrics = useMemo(() => {
		return parseLyrics(lyricsData.words as LyricWord[]);
	}, []);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden">
			{/* Fixed background gradient */}
			<div
				className="fixed inset-0 pointer-events-none"
				style={{
					backgroundImage:
						"radial-gradient(ellipse 80% 50% at 50% 40%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
				}}
			/>
			{/* Song Title */}
			<div className="fixed top-0 left-0 right-0 text-center pt-4 sm:pt-8 pb-2 sm:pb-4 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent z-10">
				<h1 className="text-xs sm:text-sm font-medium text-zinc-400 tracking-widest uppercase">
					Now Playing
				</h1>
				<h2 className="text-base sm:text-lg font-semibold text-white mt-1">
					Stay Woke (Playwright Edition)
				</h2>
			</div>

			{/* Lyrics Display */}
			<LyricsDisplay
				lines={parsedLyrics.lines}
				currentTime={audio.currentTime}
				className="flex-1 w-full max-w-4xl pt-24 sm:pt-32 pb-32 sm:pb-40"
				onSeek={audio.seek}
			/>

			{/* Audio Controls */}
			<div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-4 sm:pb-8 pt-2 sm:pt-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent">
				<AudioControls
					isPlaying={audio.isPlaying}
					currentTime={audio.currentTime}
					duration={audio.duration}
					isLoaded={audio.isLoaded}
					onToggle={audio.toggle}
					onSeek={audio.seek}
				/>
			</div>
		</div>
	);
}
