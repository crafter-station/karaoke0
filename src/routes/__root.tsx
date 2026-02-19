import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
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
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
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

			// Theme colors
			{ name: "theme-color", content: "#ffffff" },
			{ name: "author", content: "crafter-station" },
		],
		links: [
			// Google Fonts preconnect + stylesheet
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
			},
			// App styles
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

function RootComponent() {
	return <Outlet />;
}

function NotFoundComponent() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
			<h1 className="mb-4 font-serif text-5xl font-normal">404</h1>
			<p className="mb-8 text-muted-foreground">Page not found</p>
			<Link
				to="/"
				className="rounded-md bg-secondary px-6 py-3 text-secondary-foreground transition-colors hover:bg-secondary/90"
			>
				Go Home
			</Link>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
					}}
				/>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
