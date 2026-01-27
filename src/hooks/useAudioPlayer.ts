import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	isLoaded: boolean;
}

export interface AudioPlayerControls {
	play: () => void;
	pause: () => void;
	toggle: () => void;
	seek: (time: number) => void;
}

export function useAudioPlayer(
	src: string,
): AudioPlayerState & AudioPlayerControls {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);

	// Initialize audio element
	useEffect(() => {
		const audio = new Audio(src);
		audioRef.current = audio;

		const handleLoadedMetadata = () => {
			setDuration(audio.duration);
			setIsLoaded(true);
		};

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
		};

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);

		return () => {
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
			audio.pause();
			audioRef.current = null;
		};
	}, [src]);

	const play = useCallback(() => {
		audioRef.current?.play();
	}, []);

	const pause = useCallback(() => {
		audioRef.current?.pause();
	}, []);

	const toggle = useCallback(() => {
		if (audioRef.current?.paused) {
			audioRef.current?.play();
		} else {
			audioRef.current?.pause();
		}
	}, []);

	const seek = useCallback((time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	}, []);

	return {
		isPlaying,
		currentTime,
		duration,
		isLoaded,
		play,
		pause,
		toggle,
		seek,
	};
}
