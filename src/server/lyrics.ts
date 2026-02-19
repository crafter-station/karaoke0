import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { SpeechToTextChunkResponseModel } from "@elevenlabs/elevenlabs-js/api";
import { createServerFn } from "@tanstack/react-start";
import { head, put } from "@vercel/blob";

import type { LyricWord } from "@/lib/lyrics";

// Song metadata from Suno page
export interface SongMetadata {
	title: string;
	artist: string;
	imageUrl: string;
}

// Cached lyrics structure stored in Vercel Blob
export interface CachedLyrics {
	songId: string;
	transcribedAt: string;
	languageCode: string;
	languageProbability: number;
	text: string;
	words: LyricWord[];
}

// Helper to get blob storage path for a song
const getBlobPath = (songId: string) => `songs/${songId}/lyrics.json`;

// Helper to get Suno CDN URL for audio
const getSunoAudioUrl = (songId: string) =>
	`https://cdn1.suno.ai/${songId}.m4a`;

// Type guard to check if response is a single transcript (not multichannel or webhook)
function isSingleTranscript(
	response: unknown,
): response is SpeechToTextChunkResponseModel {
	return (
		typeof response === "object" &&
		response !== null &&
		"languageCode" in response &&
		"text" in response &&
		"words" in response
	);
}

/**
 * Internal: Check if lyrics are already cached in Vercel Blob
 */
async function checkCache(
	songId: string,
): Promise<
	| { status: "cached"; lyrics: CachedLyrics }
	| { status: "not_found"; lyrics: null }
> {
	const blobPath = getBlobPath(songId);

	try {
		const blobInfo = await head(blobPath);
		if (blobInfo) {
			const response = await fetch(blobInfo.url);
			const cached: CachedLyrics = await response.json();
			return { status: "cached", lyrics: cached };
		}
	} catch {
		// Blob not found - need to transcribe
	}

	return { status: "not_found", lyrics: null };
}

/**
 * Internal: Transcribe a song using ElevenLabs
 */
async function transcribe(songId: string): Promise<CachedLyrics> {
	const audioUrl = getSunoAudioUrl(songId);

	// Validate the audio exists before transcribing
	const audioCheck = await fetch(audioUrl, { method: "HEAD" });
	if (!audioCheck.ok) {
		throw new Error(`Song not found: ${songId}`);
	}

	// Initialize ElevenLabs client
	const elevenlabs = new ElevenLabsClient({
		apiKey: process.env.ELEVENLABS_API_KEY,
	});

	// Transcribe using cloud_storage_url (no download needed!)
	const result = await elevenlabs.speechToText.convert({
		modelId: "scribe_v1",
		cloudStorageUrl: audioUrl,
		timestampsGranularity: "word",
		tagAudioEvents: true,
	});

	// Ensure we got a single transcript response (not multichannel or webhook)
	if (!isSingleTranscript(result)) {
		throw new Error("Unexpected response format from ElevenLabs");
	}

	// Transform to our cached format
	const lyrics: CachedLyrics = {
		songId,
		transcribedAt: new Date().toISOString(),
		languageCode: result.languageCode,
		languageProbability: result.languageProbability,
		text: result.text,
		words: result.words.map((w) => ({
			text: w.text,
			start: w.start ?? 0,
			end: w.end ?? 0,
			type: w.type,
		})),
	};

	// Cache in Vercel Blob
	await put(getBlobPath(songId), JSON.stringify(lyrics), {
		access: "public",
		contentType: "application/json",
		addRandomSuffix: false,
	});

	return lyrics;
}

/**
 * Internal: Fetch song metadata from Suno page
 */
async function fetchMetadata(songId: string): Promise<SongMetadata> {
	const pageUrl = `https://suno.com/song/${songId}`;

	try {
		const response = await fetch(pageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch Suno page: ${response.status}`);
		}

		const html = await response.text();

		// Parse og:title meta tag
		const titleMatch = html.match(
			/<meta property="og:title" content="([^"]+)"/,
		);
		const title = titleMatch?.[1]
			? decodeHtmlEntities(titleMatch[1])
			: "Unknown Song";

		// Parse description to extract artist: "Song Title by ArtistName (@handle)"
		const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
		let artist = "Unknown Artist";
		if (descMatch?.[1]) {
			const decoded = decodeHtmlEntities(descMatch[1]);
			const artistMatch = decoded.match(/by\s+([^(]+)/);
			if (artistMatch?.[1]) {
				artist = artistMatch[1].trim();
			}
		}

		// Image URL pattern from Suno CDN
		const imageUrl = `https://cdn2.suno.ai/image_${songId}.jpeg`;

		return { title, artist, imageUrl };
	} catch (error) {
		// Return fallback metadata if fetch fails
		console.error("Failed to fetch song metadata:", error);
		return {
			title: "Suno Song",
			artist: "Unknown Artist",
			imageUrl: `https://cdn2.suno.ai/image_${songId}.jpeg`,
		};
	}
}

/**
 * Decode HTML entities like &#x27; to their actual characters
 */
function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&#x27;/g, "'")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");
}

// ============================================================================
// Server Functions (exposed to client)
// ============================================================================

/**
 * Get lyrics for a song (from cache or transcribe)
 */
export const getSongLyrics = createServerFn({ method: "GET" })
	.inputValidator((data: { songId: string }) => data)
	.handler(async ({ data }): Promise<CachedLyrics> => {
		const { songId } = data;

		// 1. Check cache first
		const cached = await checkCache(songId);
		if (cached.status === "cached" && cached.lyrics) {
			return cached.lyrics;
		}

		// 2. Not cached - transcribe
		const lyrics = await transcribe(songId);
		return lyrics;
	});

/**
 * Fetch song metadata from Suno page (title, artist, image)
 */
export const getSongMetadata = createServerFn({ method: "GET" })
	.inputValidator((data: { songId: string }) => data)
	.handler(async ({ data }): Promise<SongMetadata> => {
		const { songId } = data;
		return await fetchMetadata(songId);
	});
