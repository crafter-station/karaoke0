import { useRef, useMemo, useState, useEffect, useCallback } from "react"
import { useTheme } from "@/hooks/useTheme"
import { getVisualizerColors } from "@/lib/colors"
import type { ExtractedColors } from "@/lib/colors"

interface LiquidVisualizerProps {
	analyser: AnalyserNode | null
	colors: ExtractedColors
	isPlaying: boolean
}

export default function PremiumFluidVisualizer({ analyser, colors, isPlaying }: LiquidVisualizerProps) {
	const { isDark } = useTheme()
	const bgCanvasRef = useRef<HTMLCanvasElement>(null)
	const particlesCanvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<any[]>([])
	const [mounted, setMounted] = useState(false)
	const gradients = useMemo(() => getVisualizerColors(colors, isDark), [colors, isDark])

	useEffect(() => {
		setMounted(true)
	}, [])

	const render = useCallback(() => {
		if (!bgCanvasRef.current || !particlesCanvasRef.current || !analyser) return

		const bgCanvas = bgCanvasRef.current
		const bgCtx = bgCanvas.getContext('2d')
		const particlesCanvas = particlesCanvasRef.current
		const particlesCtx = particlesCanvas.getContext('2d')
		
		if (!bgCtx || !particlesCtx) return

		const dataArray = new Uint8Array(analyser.frequencyBinCount)
		let animationFrameId: number
		let lastTime = performance.now()

		const draw = (currentTime = performance.now()) => {
			const deltaTime = (currentTime - lastTime) / 16.67
			lastTime = currentTime

			const width = bgCanvas.width = particlesCanvas.width = window.innerWidth
			const height = bgCanvas.height = particlesCanvas.height = window.innerHeight

			analyser.getByteFrequencyData(dataArray)
			
			// Fill background with solid theme color
			bgCtx.fillStyle = isDark ? '#000000' : '#ffffff'
			bgCtx.fillRect(0, 0, width, height)
			
			particlesCtx.clearRect(0, 0, width, height)
			
			// Calculate audio intensity focused on bass/mids independently
			let bassSum = 0
			// Use more bins for a reactive feel
			for(let i = 0; i < 20; i++) bassSum += dataArray[i]
			const rawBass = isPlaying ? (bassSum / 20) / 255 : 0
            
			let midSum = 0
			for(let i = 20; i < 80; i++) midSum += dataArray[i]
			const rawMid = isPlaying ? (midSum / 60) / 255 : 0

			// Moderate scaling for pulsation (adds bounce without being aggressive)
			const bassIntensity = Math.pow(rawBass, 1.5) * 2.5 
			const midIntensity = Math.pow(rawMid, 1.2) * 1.5


			// --- PARTICLES LOGIC ---
			// Simple particle system
			if (particlesRef.current.length === 0) {
				particlesRef.current = Array.from({ length: 80 }).map(() => ({
					x: Math.random() * width,
					y: Math.random() * height,
					vx: (Math.random() - 0.5) * 2,
					vy: -(Math.random() * 2 + 1), // strongly float upwards
					size: Math.random() * 3 + 1.5,
					baseAlpha: Math.random() * 0.8 + 0.2
				}))
			}

			// Draw particles (rendered sharp on the unblurred canvas)
			particlesCtx.globalCompositeOperation = isDark ? 'screen' : 'source-over'
			particlesRef.current.forEach((p: any) => {
				// Move dynamically based on audio pulse, ensuring fluidity across devices
				p.x += p.vx * (1 + bassIntensity * 3 + midIntensity * 1.5) * deltaTime
				p.y += p.vy * (1 + bassIntensity * 6 + midIntensity * 2) * deltaTime
				
				// Wrap around screen
				if (p.x < 0) p.x = width
				if (p.x > width) p.x = 0
				// Reset at bottom when floating off top
				if (p.y < 0) {
					p.y = height
					p.x = Math.random() * width
				}
				if (p.y > height) p.y = 0

				// Controlled pulse size on beat
				const currentSize = p.size * (2 + bassIntensity * 1.2 + midIntensity * 1.5)
				
				particlesCtx.beginPath()
				particlesCtx.arc(p.x, p.y, currentSize, 0, Math.PI * 2)
				particlesCtx.fillStyle = isDark 
					? `rgba(255, 255, 255, ${Math.min(1, p.baseAlpha + bassIntensity + midIntensity)})` 
					: `rgba(0, 0, 0, ${Math.min(1, p.baseAlpha + bassIntensity + midIntensity)})`
				particlesCtx.fill()
			})

			animationFrameId = requestAnimationFrame(draw)
		}

		animationFrameId = requestAnimationFrame(draw)
		return () => cancelAnimationFrame(animationFrameId)
	}, [analyser, isPlaying, gradients, isDark])

	useEffect(() => {
		if (mounted) {
			return render()
		}
	}, [mounted, render])

	if (!mounted) return null

	return (
		<div className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 bg-background" style={{ zIndex: 0 }}>
			{/* Base colors and blobs (blurred) */}
            <canvas 
				ref={bgCanvasRef} 
				className="absolute inset-0 w-full h-full opacity-100 filter"
				style={{ zIndex: 1 }}
			/>
			
			{/* Sharp floating particles */}
			<canvas 
				ref={particlesCanvasRef} 
				className={`absolute inset-0 w-full h-full opacity-10 filter blur-[2px] ${isDark ? 'mix-blend-screen' : ''}`}
				style={{ zIndex: 2 }}
			/>
            
            {/* Overlay to ensure lyrics are readable */}
			<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" style={{ zIndex: 3 }} />
			
            {/* Frost texture for premium UX */}
            <div className="absolute inset-0 backdrop-blur-[4px] opacity-40 mix-blend-overlay" style={{ zIndex: 4 }} />
		</div>
	)
}
