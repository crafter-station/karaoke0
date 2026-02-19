import { FastAverageColor } from "fast-average-color";
import { useEffect, useState } from "react";
import type { ExtractedColors } from "@/lib/colors";
import { DEFAULT_COLORS } from "@/lib/colors";

export interface UseImageColorsResult {
	colors: ExtractedColors;
	isLoading: boolean;
	error: Error | null;
}

export function useImageColors(imageUrl: string | null): UseImageColorsResult {
	const [colors, setColors] = useState<ExtractedColors>(DEFAULT_COLORS);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!imageUrl) return;

		const url = imageUrl;
		const fac = new FastAverageColor();
		let isCancelled = false;

		async function extractColors() {
			setIsLoading(true);
			setError(null);

			try {
				// Create image with CORS
				const img = new Image();
				img.crossOrigin = "anonymous";

				await new Promise<void>((resolve, reject) => {
					img.onload = () => resolve();
					img.onerror = () => reject(new Error("Failed to load image"));
					img.src = url;
				});

				if (isCancelled) return;

				// Extract dominant color for primary
				const primaryResult = await fac.getColorAsync(img, {
					algorithm: "dominant",
				});

				// Extract average color for secondary (different algorithm = different result)
				const secondaryResult = await fac.getColorAsync(img, {
					algorithm: "sqrt",
				});

				if (isCancelled) return;

				setColors({
					primary: [
						primaryResult.value[0],
						primaryResult.value[1],
						primaryResult.value[2],
					],
					secondary: [
						secondaryResult.value[0],
						secondaryResult.value[1],
						secondaryResult.value[2],
					],
				});
			} catch (err) {
				if (!isCancelled) {
					setError(
						err instanceof Error ? err : new Error("Color extraction failed"),
					);
					// Keep default colors on error (graceful fallback)
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		}

		extractColors();

		return () => {
			isCancelled = true;
			fac.destroy();
		};
	}, [imageUrl]);

	return { colors, isLoading, error };
}
