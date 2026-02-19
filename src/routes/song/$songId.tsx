import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Home } from "lucide-react";
import { useMemo } from "react";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AudioControls } from "@/components/AudioControls";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useImageColors } from "@/hooks/useImageColors";
import type { LyricWord } from "@/lib/lyrics";
import { parseLyrics } from "@/lib/lyrics";
import { getSongLyrics, getSongMetadata } from "@/server/lyrics";

export const Route = createFileRoute("/song/$songId")({
	loader: async ({ params }) => {
		const [lyrics, metadata] = await Promise.all([
			getSongLyrics({ data: { songId: params.songId } }),
			getSongMetadata({ data: { songId: params.songId } }),
		]);
		return { lyrics, metadata };
	},
	pendingComponent: ProcessingPage,
	errorComponent: ErrorPage,
	component: SongPlayer,
});

function SongPlayer() {
	const { songId } = Route.useParams();
	const { lyrics, metadata } = Route.useLoaderData();

	// Extract colors from album cover
	const { colors } = useImageColors(metadata.imageUrl);

	// Audio from Suno CDN
	const audioUrl = `https://cdn1.suno.ai/${songId}.m4a`;
	const audio = useAudioPlayer(audioUrl);

	const parsedLyrics = useMemo(() => {
		return parseLyrics(lyrics.words as LyricWord[]);
	}, [lyrics.words]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
			{/* Animated background gradient */}
			<AnimatedBackground colors={colors} />

			{/* Header with cover image and song info */}
			<div className="fixed top-0 left-0 right-0 flex items-center justify-between h-14 px-4 sm:px-6 bg-background/60 backdrop-blur-xl border-b border-border/30 z-10">
				<Link
					to="/"
					className="shrink-0 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Go home"
				>
					<Home className="size-4" />
					<span className="text-sm font-medium hidden sm:inline">Back</span>
				</Link>

				<div className="flex items-center gap-3 min-w-0">
					<img
						src={metadata.imageUrl}
						alt={metadata.title}
						className="w-8 h-8 rounded-md object-cover shadow-sm shrink-0"
					/>
					<div className="text-left min-w-0">
						<h1 className="font-serif text-sm font-medium text-foreground line-clamp-1">
							{metadata.title}
						</h1>
						<p className="text-xs text-muted-foreground line-clamp-1">
							{metadata.artist}
						</p>
					</div>
				</div>

				<a
					href={`https://suno.com/song/${songId}`}
					target="_blank"
					rel="noopener noreferrer"
					className="shrink-0 flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
				>
					<span className="hidden sm:inline">Suno</span>
					<ExternalLink className="size-3.5" />
				</a>
			</div>

			{/* Lyrics Display */}
			<LyricsDisplay
				lines={parsedLyrics.lines}
				currentTime={audio.currentTime}
				className="flex-1 w-full max-w-4xl pt-20 sm:pt-24 pb-32 sm:pb-40"
				onSeek={audio.seek}
			/>

			{/* Audio Controls */}
			<div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-4 sm:pb-8 pt-2 sm:pt-4 bg-gradient-to-t from-background via-background/80 to-transparent">
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

function ProcessingPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
			<div className="relative z-10 flex flex-col items-center">
				{/* Spinner */}
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />

				<p className="text-foreground mt-6 text-lg font-medium">
					Transcribing lyrics...
				</p>
				<p className="text-muted-foreground text-sm mt-2 max-w-xs text-center">
					This may take up to 30 seconds for new songs
				</p>
			</div>
		</div>
	);
}

function ErrorPage({ error }: { error: Error }) {
	const errorMessage = error.message.toLowerCase();
	const isSongNotFound = errorMessage.includes("not found");
	const isSubscriptionError =
		errorMessage.includes("unusual_activity") ||
		errorMessage.includes("free tier") ||
		errorMessage.includes("401");
	const isApiKeyMissing = errorMessage.includes("api key");

	const getErrorTitle = () => {
		if (isSongNotFound) return "Song Not Found";
		if (isSubscriptionError) return "Subscription Required";
		if (isApiKeyMissing) return "Configuration Error";
		return "Something went wrong";
	};

	const getErrorMessage = () => {
		if (isSongNotFound) {
			return "The song you're looking for doesn't exist or is no longer available on Suno.";
		}
		if (isSubscriptionError) {
			return "The transcription service requires a paid ElevenLabs subscription. Please upgrade your account to use this feature.";
		}
		if (isApiKeyMissing) {
			return "The ElevenLabs API key is not configured. Please add ELEVENLABS_API_KEY to your environment variables.";
		}
		return error.message;
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
			<div className="relative z-10 flex flex-col items-center text-center">
				<h1 className="font-serif text-3xl font-normal">{getErrorTitle()}</h1>
				<p className="text-muted-foreground mt-3 max-w-md">
					{getErrorMessage()}
				</p>
				<a
					href="/"
					className="mt-6 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-colors"
				>
					Go back home
				</a>
			</div>
		</div>
	);
}
