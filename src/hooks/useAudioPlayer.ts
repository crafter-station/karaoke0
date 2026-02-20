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
	getAnalyser: () => AnalyserNode | null;
}

export function useAudioPlayer(
	src: string,
): AudioPlayerState & AudioPlayerControls {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);

	// Initialize audio element
	useEffect(() => {
		const audio = new Audio(src);
		audio.crossOrigin = "anonymous";
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

			if (audioContextRef.current) {
				audioContextRef.current.close();
				audioContextRef.current = null;
			}
		};
	}, [src]);

	const initAudioContext = useCallback(() => {
		if (!audioRef.current || audioContextRef.current) return;

		const AudioContextClass =
			window.AudioContext || (window as any).webkitAudioContext;
		const context = new AudioContextClass();
		const analyser = context.createAnalyser();
		analyser.fftSize = 256;

		const source = context.createMediaElementSource(audioRef.current);
		source.connect(analyser);
		analyser.connect(context.destination);

		audioContextRef.current = context;
		analyserRef.current = analyser;
		sourceNodeRef.current = source;
	}, []);

	const play = useCallback(() => {
		if (audioContextRef.current?.state === "suspended") {
			audioContextRef.current.resume();
		}
		initAudioContext();
		audioRef.current?.play();
	}, [initAudioContext]);

	const pause = useCallback(() => {
		audioRef.current?.pause();
	}, []);

	const toggle = useCallback(() => {
		if (audioRef.current?.paused) {
			play();
		} else {
			pause();
		}
	}, [play, pause]);

	const seek = useCallback((time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	}, []);

	const getAnalyser = useCallback(() => {
		return analyserRef.current;
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
		getAnalyser,
	};
}
