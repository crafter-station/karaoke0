import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useId, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { getSongMetadata } from "@/server/lyrics";

const FEATURED_SONG_IDS = [
	"6cdb57d5-4c36-429e-a89c-7e12dd764271",
	"a440a785-5245-4e1d-91a8-abeb064430e8",
	"3f937066-957f-4572-b617-ffbae130e03d",
	"571f0fe4-d4da-4daa-ae34-8c99c5e68441",
];

export const Route = createFileRoute("/")({
	loader: async () => {
		const metadata = await Promise.all(
			FEATURED_SONG_IDS.map((songId) => getSongMetadata({ data: { songId } })),
		);
		return {
			featuredSongs: FEATURED_SONG_IDS.map((id, i) => ({
				id,
				...metadata[i],
			})),
		};
	},
	component: LandingPage,
});

function LandingPage() {
	const { featuredSongs } = Route.useLoaderData();
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const keboClipId = useId();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		const uuidRegex =
			/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
		const match = url.match(uuidRegex);

		if (!match) {
			setError("Please enter a valid Suno song URL");
			return;
		}

		navigate({ to: "/song/$songId", params: { songId: match[0] } });
	}

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground">
			{/* Sticky Navigation */}
			<nav className="sticky top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
				<div className="mx-auto flex h-full max-w-[1040px] items-center justify-between px-6">
					<Link
						to="/"
						className="font-serif text-xl tracking-tight text-foreground"
					>
						karaoke
						<span className="text-primary text-3xl font-bold leading-none align-baseline">
							0
						</span>
					</Link>
					<ThemeToggle />
				</div>
			</nav>

			{/* Hero Section */}
			<section className="mx-auto w-full max-w-[1040px] px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
				<motion.h1
					className="font-serif text-4xl sm:text-5xl md:text-[65px] font-normal tracking-[-0.025em] text-foreground leading-[1.1]"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					Sing along to any song,
					<br />
					word by word.
				</motion.h1>

				<motion.p
					className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
				>
					A beautiful lyrics player with perfectly synced karaoke-style word
					highlighting. Paste a Suno URL and start singing.
				</motion.p>

				{/* URL Input */}
				<motion.form
					onSubmit={handleSubmit}
					className="mx-auto mt-10 max-w-lg"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
				>
					<div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1.5 pl-4 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
						<input
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="Paste a Suno song URL..."
							className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-[15px]"
						/>
						<button
							type="submit"
							disabled={!url.trim()}
							className="shrink-0 rounded-md bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90 disabled:opacity-50"
						>
							Play
						</button>
					</div>
					{error && (
						<p className="mt-2 text-sm text-destructive text-center">{error}</p>
					)}
					<p className="mt-3 text-sm text-muted-foreground">
						Don't have a song URL?{" "}
						<a
							href="https://suno.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
						>
							Browse songs on Suno
						</a>{" "}
						and copy any song link to try it here.
					</p>
				</motion.form>
			</section>

			{/* Featured Songs Section */}
			<section className="w-full bg-muted py-16 sm:py-20">
				<div className="mx-auto max-w-[1040px] px-6">
					<motion.div
						className="text-center"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
					>
						<h2 className="font-serif text-2xl sm:text-[32px] font-normal text-foreground">
							Featured Songs
						</h2>
						<p className="mt-3 text-muted-foreground">
							Try one of these to see the experience
						</p>
					</motion.div>

					<motion.div
						className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
					>
						{featuredSongs.map((song) => (
							<FeaturedSongCard key={song.id} song={song} />
						))}
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full bg-primary py-12 mt-auto">
				<div className="mx-auto max-w-[1040px] px-6 text-center">
					<p className="font-serif text-xl text-white">
						karaoke
						<span className="opacity-70 text-3xl font-bold leading-none align-baseline">
							0
						</span>
					</p>
					<p className="mt-3 text-sm text-white/60">
						Built with Suno + ElevenLabs
					</p>

					{/* Partner logos */}
					<div className="mt-6 flex items-center justify-center gap-4 text-white/50">
						<a
							href="https://kebo.app"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center hover:text-white/80 transition-colors"
							aria-label="Kebo"
						>
							<svg
								width="329"
								height="328"
								viewBox="0 0 329 328"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-auto"
							>
								<title>Kebo Logo</title>
								<g clipPath={`url(#${keboClipId})`}>
									<path
										d="M186.341 135.743L186.274 135.659L186.206 135.726L167.398 134.951L27.3013 129.132C12.4371 128.508 0.0166016 137.919 0.0166016 150.163V183.774C0.0166016 196.017 12.4371 205.411 27.3013 204.77L117.329 200.908L37.2107 276.732C26.9811 286.412 26.9811 300.038 37.2107 306.818L64.1246 324.661C73.5284 330.901 88.342 328.017 97.2234 318.556L167.382 243.761V312.603C167.382 322.62 175.724 328.928 185.768 326.752L211.991 321.035C221.091 319.062 228.288 310.022 228.288 300.797V154.143C228.288 144.935 221.091 137.16 211.991 136.772L186.341 135.71V135.743Z"
										fill="currentColor"
									/>
									<path
										opacity="0.5"
										d="M205.856 196.878L205.924 196.945L205.991 196.861L223.788 196.119L316.411 192.274C323.438 191.987 329 185.173 329 177.062V154.783C329 146.672 323.421 139.858 316.411 139.555L263.695 137.295L311.49 87.949C316.546 82.7209 316.546 73.243 311.49 66.5815L297.165 47.7437C291.789 40.6606 282.874 38.9404 277.245 44.0672L223.771 92.8903V27.5736C223.771 18.062 216.103 8.68526 206.413 6.57719L178.42 0.472195C167.685 -1.87199 158.753 4.60403 158.753 14.9758V180.064C158.753 190.435 167.685 198.48 178.42 198.024L205.856 196.878Z"
										fill="currentColor"
									/>
								</g>
								<defs>
									<clipPath id={keboClipId}>
										<rect width="329" height="328" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</a>
						<div className="h-4 w-px bg-white/20" />
						<a
							href="https://www.crafterstation.com"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center hover:text-white/80 transition-colors"
							aria-label="Crafter Station"
						>
							<svg
								width="257"
								height="257"
								viewBox="0 0 257 257"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-auto scale-[0.8]"
							>
								<title>Crafter Station Logo</title>
								<path
									d="M116.419 16.3268C109.59 11.5679 97.9222 5.96914 90.2388 3.72965C72.8798 -1.58913 59.1794 1.40491 50.114 4.56947C32.4704 10.7281 21.3721 18.8462 11.412 33.6828C-4.23949 56.6375 -1.96292 93.869 17.1035 114.864C21.3721 119.903 23.6487 119.063 40.1539 107.026C40.723 106.466 38.4465 102.827 35.0316 98.6278C27.3481 89.11 22.7949 71.754 25.0715 61.9563C32.4704 31.1634 70.3187 14.6472 94.7919 31.4433C100.199 35.0825 117.273 50.199 132.64 65.0356C155.691 86.8706 162.52 91.9094 168.212 91.3496C173.903 90.7897 175.895 88.8301 176.464 82.6715C177.318 75.9531 174.757 72.034 161.667 60.2767C152.845 52.1585 145.731 44.8802 145.731 43.4805C145.731 42.3608 151.707 37.6019 159.105 33.1229C206.914 3.1698 258.421 62.7961 218.581 101.987C213.459 107.026 204.353 112.345 198.377 114.024C191.547 115.704 159.959 117.104 120.688 117.104C47.2683 117.104 43.2842 117.943 23.9332 135.02C-0.824636 157.134 -6.51609 194.926 10.8429 222.359C33.3241 258.191 81.7016 267.149 115.85 241.675L128.372 232.157L142.885 241.675C166.504 257.351 185.571 260.431 208.621 252.872C254.722 237.476 271.796 179.809 241.916 141.178C238.501 136.979 236.794 136.699 232.241 138.939C218.297 146.777 218.581 146.217 226.834 163.013C233.094 175.89 234.233 180.929 232.81 190.727C228.826 215.361 210.044 231.877 186.14 231.877C167.643 231.877 161.667 228.238 127.518 195.486C109.59 178.689 93.0845 164.693 90.8079 164.693C86.5393 164.693 77.433 173.371 77.433 177.57C77.433 178.689 85.1165 187.647 94.7919 197.165L112.151 214.241L101.906 222.08C65.7655 249.233 14.2578 216.761 26.2098 174.211C29.9093 161.333 42.9996 147.057 55.5209 142.578C60.3586 140.618 90.2388 139.498 130.648 139.498C204.922 139.498 213.744 138.099 230.818 123.542C281.757 80.9919 252.161 0.930299 185.571 1.21023C166.22 1.21023 155.691 5.12933 137.762 18.2863L128.656 25.0048L116.419 16.3268Z"
									fill="currentColor"
								/>
							</svg>
						</a>
						<div className="h-4 w-px bg-white/20" />
						<a
							href="https://www.moraleja.co"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center hover:text-white/80 transition-colors"
							aria-label="Moraleja Design"
						>
							<svg
								viewBox="0 0 184.3 184.3"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-auto"
							>
								<title>Moraleja Design Logo</title>
								<path
									d="M125.1,94.2c1.7,2,3.9,3.6,6,5.1,10.6,7.8,23.6,14.9,33.6,23.2,2,1.6,6.8,5.7,4.1,8.3s-7.1,1.2-9.8,1.1c-14.7-1-31.3-2.8-45.9-5.1-4.2-.7-5.1-2.7-8.7.9-5.5,5.5-11.9,14.4-16.9,20.7-4.1,5.3-8.8,13.2-13.1,17.7-2,2.1-3.4,2.1-4.7-.6-1.1-12-1.9-24-3.1-36-.6-5.5-1-11.2-2.2-16.6-.9-.7-10.4,3.1-12.2,3.7-2.5.8-5.1,1.3-7.6,2-7.7,2.3-16.9,6-24.7,7.4-3.2.6-6.5-.3-4.4-4.1,1.7-3.1,12.7-11.9,16-14.8,8.9-7.7,18.3-15.1,27.4-22.6l.8-1.1c0-.8-2.9-4.3-3.6-5.2-8.8-11.1-19.2-22-27.2-33.8-1.3-1.9-5.1-6.5-1.6-7.8,2.2-.9,6.5,1.4,8.7,2.3,9.8,4.3,19,10.1,28.6,15,4.1,2.1,11.2,6,15.3,7.3s.7.3,1.2,0c.5-2.2,1.3-4.4,2-6.5,4-10.9,7.8-22.6,12.2-33.2.8-1.9,1.8-6.3,4.8-5.2,1.8.7,2.8,7.1,4.1,8.8l10.4,36.9c7.8-.8,15.5-3,23.2-4.3,5.9-1,12.6-2.1,18.5-2.5,19.7-1.4,6.1,9.6-.9,15.8-8.5,7.5-18.9,15.3-28.1,21.9s-1.3.9-2.1,1.1Z"
									fill="currentColor"
								/>
								<g className="fill-white/50">
									<path d="M109.2,95c1.3-.9,3,.4,2.4,1.9-1.6,3.5-5.6,6.8-8.5,7.9-6,2.3-11.6,2.2-17.4-.6s-11.5-6.6-7.9-9.5c2.1-1.7,4.6,2.1,6.3,3.3,6.8,5,13.3,5.1,20.4.5.7-.4,2.9-2.3,4.7-3.6Z" />
									<path d="M101.5,90c-1.2,2-5.3.2-3.6-2.2,1.7-2.5,4.7.3,3.6,2.2Z" />
									<path d="M88.1,87.6c1.1.6.8,2.4-.5,2.8-2.7.8-2-4.2.5-2.8Z" />
								</g>
							</svg>
						</a>
						<div className="h-4 w-px bg-white/20" />
						<a
							href="https://github.com/crafter-station/karaoke0"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center hover:text-white/80 transition-colors"
							aria-label="GitHub"
						>
							<svg
								role="img"
								viewBox="0 0 97.6 96"
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-auto"
							>
								<title>GitHub</title>
								<path
									fill="currentColor"
									d="M48.9,0C21.8,0,0,22,0,49.2C0,71,14,89.4,33.4,95.9c2.4,0.5,3.3-1.1,3.3-2.4c0-1.1-0.1-5.1-0.1-9.1  c-13.6,2.9-16.4-5.9-16.4-5.9c-2.2-5.7-5.4-7.2-5.4-7.2c-4.4-3,0.3-3,0.3-3c4.9,0.3,7.5,5.1,7.5,5.1c4.4,7.5,11.4,5.4,14.2,4.1  c0.4-3.2,1.7-5.4,3.1-6.6c-10.8-1.1-22.2-5.4-22.2-24.3c0-5.4,1.9-9.8,5-13.2c-0.5-1.2-2.2-6.3,0.5-13c0,0,4.1-1.3,13.4,5.1  c3.9-1.1,8.1-1.6,12.2-1.6s8.3,0.6,12.2,1.6c9.3-6.4,13.4-5.1,13.4-5.1c2.7,6.8,1,11.8,0.5,13c3.2,3.4,5,7.8,5,13.2  c0,18.9-11.4,23.1-22.3,24.3c1.8,1.5,3.3,4.5,3.3,9.1c0,6.6-0.1,11.9-0.1,13.5c0,1.3,0.9,2.9,3.3,2.4C83.6,89.4,97.6,71,97.6,49.2  C97.7,22,75.8,0,48.9,0z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeaturedSongCard({
	song,
}: {
	song: { id: string; title: string; artist: string; imageUrl: string };
}) {
	return (
		<Link
			to="/song/$songId"
			params={{ songId: song.id }}
			className="group block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
		>
			<div className="aspect-square rounded-md overflow-hidden mb-3">
				<img
					src={song.imageUrl}
					alt={song.title}
					className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
			<h3 className="font-sans text-sm font-semibold text-foreground line-clamp-1">
				{song.title}
			</h3>
			<p className="text-muted-foreground text-xs mt-1 line-clamp-1">
				{song.artist}
			</p>
		</Link>
	);
}
