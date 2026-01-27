import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { LyricLine } from "@/lib/lyrics";
import { getCurrentLineIndex, isWordActive } from "@/lib/lyrics";
import { cn } from "@/lib/utils";

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 639px)");
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return isMobile;
}

interface LyricsDisplayProps {
	lines: LyricLine[];
	currentTime: number;
	className?: string;
	onSeek?: (time: number) => void;
}

export function LyricsDisplay({
	lines,
	currentTime,
	className,
	onSeek,
}: LyricsDisplayProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const currentLineIndex = getCurrentLineIndex(lines, currentTime);
	const isMobile = useIsMobile();

	// Auto-scroll to keep current line centered
	useEffect(() => {
		if (!containerRef.current) return;

		const currentLineElement = containerRef.current.querySelector(
			`[data-line-index="${currentLineIndex}"]`,
		);

		if (currentLineElement) {
			currentLineElement.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [currentLineIndex]);

	return (
		<div
			ref={containerRef}
			className={cn(
				"flex flex-col items-center justify-center gap-3 sm:gap-4 overflow-hidden px-2 sm:px-4",
				className,
			)}
		>
			{lines.map((line) => {
				const distance = Math.abs(line.lineIndex - currentLineIndex);
				const isCurrent = line.lineIndex === currentLineIndex;
				const isPast = line.lineIndex < currentLineIndex;

				// Calculate opacity based on distance from current line
				let opacity = 1;
				if (!isCurrent) {
					opacity = Math.max(0.1, 1 - distance * 0.25);
				}

				// Add extra spacing for lines with significant gaps (2+ seconds)
				const hasLargeGap = line.gapBefore >= 2;

				return (
					<LyricLineComponent
						key={line.lineIndex}
						line={line}
						currentTime={currentTime}
						isCurrent={isCurrent}
						isPast={isPast}
						opacity={opacity}
						hasLargeGap={hasLargeGap}
						isMobile={isMobile}
						onSeek={onSeek}
					/>
				);
			})}
		</div>
	);
}

interface LyricLineComponentProps {
	line: LyricLine;
	currentTime: number;
	isCurrent: boolean;
	isPast: boolean;
	opacity: number;
	hasLargeGap: boolean;
	isMobile: boolean;
	onSeek?: (time: number) => void;
}

function LyricLineComponent({
	line,
	currentTime,
	isCurrent,
	isPast,
	opacity,
	hasLargeGap,
	isMobile,
	onSeek,
}: LyricLineComponentProps) {
	// Use scale instead of font-size changes to avoid layout reflow
	// Smaller scale on mobile to prevent overflow
	const scale = isCurrent ? (isMobile ? 1.05 : 1.15) : 1;

	return (
		<motion.div
			data-line-index={line.lineIndex}
			layout
			initial={false}
			animate={{
				opacity,
				scale,
			}}
			transition={{
				opacity: { duration: 0.3, ease: "easeOut" },
				scale: { type: "spring", stiffness: 300, damping: 30 },
				layout: { type: "spring", stiffness: 300, damping: 30 },
			}}
			className={cn(
				"text-center font-bold text-sm sm:text-base md:text-lg lg:text-xl origin-center max-w-full px-2 break-words",
				hasLargeGap && "mt-4 sm:mt-8",
			)}
		>
			{line.words.map((word, idx) => {
				// Skip rendering spacing as separate spans, include in word
				if (word.type === "spacing") {
					return (
						<span key={`${line.lineIndex}-${idx}`} className="whitespace-pre">
							{word.text}
						</span>
					);
				}

				const isActive = isWordActive(word, currentTime);
				const shouldHighlight = isPast || (isCurrent && isActive);

				return (
					<motion.span
						key={`${line.lineIndex}-${idx}`}
						role="button"
						tabIndex={0}
						onClick={() => onSeek?.(word.start)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onSeek?.(word.start);
							}
						}}
						animate={{
							color: shouldHighlight ? "#ffffff" : "#71717a",
							textShadow:
								isCurrent && isActive
									? "0 0 8px rgba(255,255,255,0.4)"
									: "0 0 0px rgba(255,255,255,0)",
						}}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="cursor-pointer hover:opacity-80"
					>
						{word.text}
					</motion.span>
				);
			})}
		</motion.div>
	);
}
