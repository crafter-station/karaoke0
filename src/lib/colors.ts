export interface ExtractedColors {
	primary: [number, number, number];
	secondary: [number, number, number];
}

// Default colors - transparent black so gradient fades in from background
export const DEFAULT_COLORS: ExtractedColors = {
	primary: [0, 0, 0], // Start invisible (matches dark bg)
	secondary: [0, 0, 0], // Start invisible
};

export function rgbToRgba(
	rgb: [number, number, number],
	alpha: number,
): string {
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function generateGradientStyle(
	colors: ExtractedColors,
	isDark = true,
): string {
	const opacityScale = isDark ? 1 : 0.35;
	const primary = rgbToRgba(colors.primary, 0.35 * opacityScale);
	const secondary = rgbToRgba(colors.secondary, 0.25 * opacityScale);

	return `radial-gradient(ellipse 80% 50% at 50% 40%, ${primary} 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 70% 60%, ${secondary} 0%, transparent 50%)`;
}

// Gradient colors for animated blobs with high opacity for visibility
export function getGradientColors(colors: ExtractedColors, isDark = true) {
	// Create a tertiary color by blending primary and secondary
	const tertiary: [number, number, number] = [
		Math.round((colors.primary[0] + colors.secondary[0]) / 2),
		Math.round((colors.primary[1] + colors.secondary[1]) / 2),
		Math.round((colors.primary[2] + colors.secondary[2]) / 2),
	];

	// In light mode, reduce opacity so blobs appear as gentle pastel washes
	const opacityScale = isDark ? 1 : 0.35;

	return {
		primary: rgbToRgba(colors.primary, 0.5 * opacityScale),
		secondary: rgbToRgba(colors.secondary, 0.4 * opacityScale),
		tertiary: rgbToRgba(tertiary, 0.3 * opacityScale),
	};
}
