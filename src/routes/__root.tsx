import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const siteConfig = {
	title: "karaoke0 - Spotify-like lyrics player for any song",
	description:
		"A beautiful lyrics player with word-by-word sync highlighting. Play any song with perfectly timed karaoke-style lyrics.",
	url: "https://karaoke0.vercel.app",
	image: "https://karaoke0.vercel.app/og-image.png",
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: siteConfig.title },
			{ name: "description", content: siteConfig.description },

			// Open Graph
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: "karaoke0" },
			{ property: "og:title", content: siteConfig.title },
			{ property: "og:description", content: siteConfig.description },
			{ property: "og:image", content: siteConfig.image },
			{ property: "og:url", content: siteConfig.url },

			// Twitter Card
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: siteConfig.title },
			{ name: "twitter:description", content: siteConfig.description },
			{ name: "twitter:image", content: siteConfig.image },

			// Additional SEO
			{ name: "theme-color", content: "#09090b" },
			{ name: "author", content: "crafter-station" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-zinc-950">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
