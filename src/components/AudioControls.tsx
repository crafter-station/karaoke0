import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/lyrics";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	isLoaded: boolean;
	onToggle: () => void;
	onSeek: (time: number) => void;
	className?: string;
}

export function AudioControls({
	isPlaying,
	currentTime,
	duration,
	isLoaded,
	onToggle,
	onSeek,
	className,
}: AudioControlsProps) {
	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md",
				className,
			)}
		>
			{/* Play/Pause Button */}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={onToggle}
				disabled={!isLoaded}
				className="size-12 sm:size-16 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm transition-all duration-200 hover:scale-105"
			>
				{isPlaying ? (
					<Pause className="size-6 sm:size-8" fill="currentColor" />
				) : (
					<Play
						className="size-6 sm:size-8 ml-0.5 sm:ml-1"
						fill="currentColor"
					/>
				)}
			</Button>

			{/* Progress Bar */}
			<div className="w-full flex items-center gap-3">
				<span className="text-xs text-zinc-400 font-mono w-10 text-right">
					{formatTime(currentTime)}
				</span>
				<Slider
					value={[progress]}
					max={100}
					step={0.1}
					onValueChange={([value]) => {
						if (duration > 0) {
							onSeek((value / 100) * duration);
						}
					}}
					disabled={!isLoaded}
					className="flex-1 [&_[data-slot=slider-track]]:bg-zinc-700 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:size-3"
				/>
				<span className="text-xs text-zinc-400 font-mono w-10">
					{formatTime(duration)}
				</span>
			</div>
		</div>
	);
}
