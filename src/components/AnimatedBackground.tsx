import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import { useTheme } from "@/hooks/useTheme";

import type { ExtractedColors } from "@/lib/colors";
import { generateGradientStyle, getGradientColors } from "@/lib/colors";

interface AnimatedBackgroundProps {
	colors: ExtractedColors;
}

export function AnimatedBackground({ colors }: AnimatedBackgroundProps) {
	const shouldReduceMotion = useReducedMotion();
	const { isDark } = useTheme();
	const gradients = useMemo(
		() => getGradientColors(colors, isDark),
		[colors, isDark],
	);

	// Static gradient for reduced motion preference
	if (shouldReduceMotion) {
		return (
			<div
				className="fixed inset-0 pointer-events-none"
				style={{
					background: generateGradientStyle(colors, isDark),
				}}
			/>
		);
	}

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden">
			{/* Primary blob - top left area */}
			<motion.div
				className="absolute rounded-full"
				style={{
					width: "80vmax",
					height: "80vmax",
					left: "-25%",
					top: "-25%",
					filter: "blur(40px)",
				}}
				animate={{
					background: `radial-gradient(circle at center, ${gradients.primary} 0%, transparent 70%)`,
					x: ["0%", "15%", "-10%", "5%", "0%"],
					y: ["0%", "-12%", "8%", "-5%", "0%"],
					scale: [1, 1.15, 0.85, 1.1, 1],
				}}
				transition={{
					duration: 15,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					background: { duration: 1.5, ease: "easeOut" },
				}}
			/>

			{/* Secondary blob - bottom right area */}
			<motion.div
				className="absolute rounded-full"
				style={{
					width: "70vmax",
					height: "70vmax",
					right: "-20%",
					bottom: "-20%",
					filter: "blur(50px)",
				}}
				animate={{
					background: `radial-gradient(circle at center, ${gradients.secondary} 0%, transparent 70%)`,
					x: ["0%", "-20%", "15%", "-8%", "0%"],
					y: ["0%", "15%", "-12%", "10%", "0%"],
					scale: [1, 0.8, 1.2, 0.9, 1],
				}}
				transition={{
					duration: 18,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					background: { duration: 1.5, ease: "easeOut" },
				}}
			/>

			{/* Tertiary blob - center */}
			<motion.div
				className="absolute rounded-full"
				style={{
					width: "60vmax",
					height: "60vmax",
					left: "20%",
					top: "25%",
					filter: "blur(60px)",
				}}
				animate={{
					background: `radial-gradient(circle at center, ${gradients.tertiary} 0%, transparent 60%)`,
					x: ["0%", "25%", "-15%", "10%", "0%"],
					y: ["0%", "-18%", "12%", "-8%", "0%"],
					scale: [1, 1.1, 0.9, 1.05, 1],
				}}
				transition={{
					duration: 12,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					background: { duration: 1.5, ease: "easeOut" },
				}}
			/>
		</div>
	);
}
