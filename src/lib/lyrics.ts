export interface LyricWord {
	text: string;
	start: number;
	end: number;
	type: "word" | "spacing" | "audio_event";
}

export interface LyricLine {
	words: LyricWord[];
	text: string;
	startTime: number;
	endTime: number;
	lineIndex: number;
	gapBefore: number; // seconds of silence before this line
}

export interface ParsedLyrics {
	lines: LyricLine[];
	totalDuration: number;
}

// Sentence-ending punctuation (splits lines)
// Handle ellipsis as single unit - "..." at end of word ends line
function endsLine(word: string): boolean {
	// Check for sentence-ending punctuation at the end of the word
	// Handles: "it.", "woke!", "test?", "so..."
	return /[.!?]$/.test(word);
}

export function parseLyrics(words: LyricWord[]): ParsedLyrics {
	const lines: LyricLine[] = [];
	let currentLineWords: LyricWord[] = [];
	let lineIndex = 0;

	for (const word of words) {
		// Skip audio events like [singing], [music]
		if (word.type === "audio_event") {
			continue;
		}

		// Add word to current line
		currentLineWords.push(word);

		// Check if this word ends a line (only check actual words, not spacing)
		if (word.type === "word" && endsLine(word.text)) {
			// Build the line
			const lineText = currentLineWords
				.map((w) => w.text)
				.join("")
				.trim();

			if (lineText.length > 0) {
				const wordsOnly = currentLineWords.filter((w) => w.type === "word");
				const startTime = wordsOnly[0]?.start ?? 0;
				const previousLine = lines[lines.length - 1];
				const gapBefore = previousLine
					? Math.max(0, startTime - previousLine.endTime)
					: 0;

				lines.push({
					words: currentLineWords,
					text: lineText,
					startTime,
					endTime: wordsOnly[wordsOnly.length - 1]?.end ?? 0,
					lineIndex: lineIndex++,
					gapBefore,
				});
			}

			// Reset for next line
			currentLineWords = [];
		}
	}

	// Don't forget remaining words if they don't end with punctuation
	if (currentLineWords.length > 0) {
		const lineText = currentLineWords
			.map((w) => w.text)
			.join("")
			.trim();

		if (lineText.length > 0) {
			const wordsOnly = currentLineWords.filter((w) => w.type === "word");
			const startTime = wordsOnly[0]?.start ?? 0;
			const previousLine = lines[lines.length - 1];
			const gapBefore = previousLine
				? Math.max(0, startTime - previousLine.endTime)
				: 0;

			lines.push({
				words: currentLineWords,
				text: lineText,
				startTime,
				endTime: wordsOnly[wordsOnly.length - 1]?.end ?? 0,
				lineIndex: lineIndex,
				gapBefore,
			});
		}
	}

	const totalDuration = words[words.length - 1]?.end ?? 0;

	return { lines, totalDuration };
}

// Find the current line index based on playback time
export function getCurrentLineIndex(
	lines: LyricLine[],
	currentTime: number,
): number {
	for (let i = lines.length - 1; i >= 0; i--) {
		if (currentTime >= lines[i].startTime) {
			return i;
		}
	}
	return 0;
}

// Check if a word should be highlighted based on current time
export function isWordActive(word: LyricWord, currentTime: number): boolean {
	return currentTime >= word.start;
}

// Format time in mm:ss format
export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}
