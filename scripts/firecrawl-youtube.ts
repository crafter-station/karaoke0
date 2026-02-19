/**
 * Firecrawl + Yout.com Experiment
 *
 * FINDINGS:
 * ---------
 * 1. Yout.com's format-shift button click via Firecrawl is unreliable:
 *    - Sometimes actions fail entirely with "All scraping engines failed"
 *    - When actions "succeed", the click doesn't actually trigger the
 *      format-shift process (page content remains unchanged)
 *    - The button click triggers an AJAX request that Firecrawl can't
 *      intercept or wait for
 *
 * 2. Yout.com has an official API at `dvr.yout.com` that requires a paid API key:
 *    - POST https://dvr.yout.com/mp3
 *    - Headers: Authorization: YOUR_API_KEY
 *    - Body: video_url (base64), start_time, end_time, title, audio_quality
 *
 * CONCLUSION:
 * -----------
 * Firecrawl is not suitable for automating yout.com's download flow because:
 * - The format-shift process is AJAX-based (click triggers async processing)
 * - The download URL is returned dynamically via JavaScript
 * - Firecrawl can't intercept network responses to capture the download URL
 *
 * Use Yout.com's official API for reliable programmatic downloads.
 *
 * USAGE:
 * ------
 * FIRECRAWL_API_KEY=fc-xxx bun run scripts/firecrawl-youtube.ts
 */

import Firecrawl from "@mendable/firecrawl-js"

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

if (!FIRECRAWL_API_KEY) {
	console.error("Error: FIRECRAWL_API_KEY environment variable is required")
	console.error("Usage: FIRECRAWL_API_KEY=fc-xxx bun run scripts/firecrawl-youtube.ts")
	process.exit(1)
}

const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY })

// Test YouTube URL
const youtubeUrl = "https://youtu.be/kXxvV5KKNfM"
const youtUrl = `https://yout.com/video/?url=${youtubeUrl}`

console.log("Firecrawl + Yout.com Experiment")
console.log("================================")
console.log(`Target URL: ${youtUrl}`)

async function saveScreenshot(data: string | undefined, filename: string) {
	if (!data) {
		console.log(`  No screenshot data for ${filename}`)
		return
	}
	if (data.startsWith("data:image")) {
		const base64Data = data.split(",")[1]
		const buffer = Buffer.from(base64Data, "base64")
		await Bun.write(`scripts/${filename}`, buffer)
		console.log(`  Screenshot saved to scripts/${filename}`)
	} else {
		try {
			const buffer = Buffer.from(data, "base64")
			await Bun.write(`scripts/${filename}`, buffer)
			console.log(`  Screenshot saved to scripts/${filename}`)
		} catch {
			console.log(`  Could not decode screenshot for ${filename}`)
		}
	}
}

async function main() {
	// Test 1: Simple scrape (should work)
	console.log("\n[Test 1] Simple scrape without actions")
	console.log("---------------------------------------")
	try {
		const result = await firecrawl.scrape(youtUrl, {
			formats: ["markdown"],
			timeout: 30000,
		})
		console.log("  Status: SUCCESS")
		console.log("  Content preview:", result.markdown?.slice(0, 200).replace(/\n/g, " "))
	} catch (error) {
		console.log("  Status: FAILED")
		console.log("  Error:", (error as Error).message?.slice(0, 100))
	}

	// Test 2: Scrape with wait action (should work)
	console.log("\n[Test 2] Scrape with wait action only")
	console.log("--------------------------------------")
	try {
		const result = await firecrawl.scrape(youtUrl, {
			formats: ["markdown", { type: "screenshot", fullPage: false }],
			actions: [{ type: "wait", milliseconds: 2000 }],
			timeout: 30000,
		})
		console.log("  Status: SUCCESS")
		await saveScreenshot(result.screenshot, "test2-wait.png")
	} catch (error) {
		console.log("  Status: FAILED")
		console.log("  Error:", (error as Error).message?.slice(0, 100))
	}

	// Test 3: Scrape with click action
	console.log("\n[Test 3] Scrape with click action on format-shift button")
	console.log("----------------------------------------------------------")
	try {
		const result = await firecrawl.scrape(youtUrl, {
			formats: ["markdown", { type: "screenshot", fullPage: false }],
			actions: [
				{ type: "wait", milliseconds: 2000 },
				{ type: "click", selector: "#format-shift-btn" },
				{ type: "wait", milliseconds: 3000 }, // Wait for potential AJAX
			],
			timeout: 45000,
		})
		console.log("  Status: Request completed")
		// Check if content changed after click
		const hasDownloadLink = result.markdown?.includes("download") || false
		const hasProgressIndicator = result.markdown?.includes("progress") || false
		console.log("  Download link found:", hasDownloadLink)
		console.log("  Progress indicator found:", hasProgressIndicator)
		console.log("  Note: Click may execute but AJAX response can't be captured")
		await saveScreenshot(result.screenshot, "test3-after-click.png")
	} catch (error) {
		console.log("  Status: FAILED")
		console.log("  Error:", (error as Error).message?.slice(0, 150))
	}

	// Test 4: Scrape with executeJavascript
	console.log("\n[Test 4] Scrape with executeJavascript to click button")
	console.log("-------------------------------------------------------")
	try {
		const result = await firecrawl.scrape(youtUrl, {
			formats: ["markdown", { type: "screenshot", fullPage: false }],
			actions: [
				{ type: "wait", milliseconds: 2000 },
				{
					type: "executeJavascript",
					script: `
						const btn = document.querySelector('#format-shift-btn');
						if (btn) btn.click();
						return { clicked: !!btn };
					`,
				},
				{ type: "wait", milliseconds: 3000 },
			],
			timeout: 45000,
		})
		console.log("  Status: Request completed")
		const hasDownloadLink = result.markdown?.includes("download") || false
		console.log("  Download link found:", hasDownloadLink)
		console.log("  Note: JS executes but async responses aren't captured")
		await saveScreenshot(result.screenshot, "test4-after-js.png")
	} catch (error) {
		console.log("  Status: FAILED")
		console.log("  Error:", (error as Error).message?.slice(0, 150))
	}

	// Summary
	console.log("\n")
	console.log("=".repeat(60))
	console.log("SUMMARY")
	console.log("=".repeat(60))
	console.log(`
Firecrawl CAN scrape yout.com and execute clicks, but cannot
capture the download URL because:

1. The format-shift button triggers an AJAX request
2. The download URL is returned via JavaScript async response
3. Firecrawl captures the page state, not network responses

This is a fundamental limitation: Firecrawl is designed for
scraping static/rendered content, not intercepting API responses.

RECOMMENDED ALTERNATIVE: Yout.com's official API at dvr.yout.com
                         (requires paid API key from yout.com/pricing/api/)

Example API call:
  curl -L -X POST "https://dvr.yout.com/mp3" \\
    -H "Authorization: YOUR_YOUT_API_KEY" \\
    -H "Content-Type: application/x-www-form-urlencoded" \\
    --data-urlencode "video_url=$(echo -n '${youtubeUrl}' | base64)" \\
    --data-urlencode "audio_quality=128k" \\
    --data-urlencode "title=My Song" \\
    --output "audio.mp3"
`)
}

main()
