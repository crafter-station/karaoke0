# Synced Lyrics Player

A Spotify-like lyrics player that syncs audio with word-by-word highlighting. Built with TanStack Start, React 19, and Framer Motion.

## Demo Song

The included demo uses ["Stay Woke (Playwright Edition)"](https://suno.com/song/3f937066-957f-4572-b617-ffbae130e03d) - an AI-generated song about software testing created with [Suno](https://suno.com).

## Features

- **Word-by-word highlighting** - Each word lights up precisely when it's sung
- **Click to seek** - Click any word to jump to that point in the song
- **Smooth animations** - Framer Motion provides buttery-smooth transitions
- **Auto-scroll** - Lyrics automatically scroll to keep the current line centered
- **Section gaps** - Visual spacing between verse/chorus sections based on audio timing
- **Responsive design** - Optimized for mobile, tablet, and desktop
- **Dark theme** - Beautiful dark UI with gradient backgrounds

## How It Works

### Data Structure

The lyrics are stored in `public/song/lyrics.json` with word-level timing:

```json
{
  "words": [
    { "text": "Too", "start": 23.9, "end": 24.2, "type": "word" },
    { "text": " ", "start": 24.2, "end": 24.24, "type": "spacing" },
    { "text": "late,", "start": 24.24, "end": 26.12, "type": "word" },
    ...
  ]
}
```

Each word has:
- `text` - The word/spacing content
- `start` / `end` - Timestamps in seconds
- `type` - Either `"word"`, `"spacing"`, or `"audio_event"` (filtered out)

### Lyrics Parsing (`src/lib/lyrics.ts`)

The parser converts raw word data into lines:

1. **Line splitting** - Words are grouped into lines based on sentence-ending punctuation (`.`, `!`, `?`)
2. **Gap detection** - Calculates silence duration between lines to add visual spacing
3. **Filtering** - Removes audio events like `[singing]`, `[music]`

### Audio Player (`src/hooks/useAudioPlayer.ts`)

Custom hook managing audio playback:
- Play/pause/toggle controls
- Seek to specific timestamps
- Real-time `currentTime` updates
- Duration and loading state

### Lyrics Display (`src/components/LyricsDisplay.tsx`)

The main visualization component:
- **Framer Motion animations** - Uses `scale` transforms (not font-size) for smooth focus effects
- **Distance-based opacity** - Lines further from current fade out gradually
- **Auto-scroll** - `scrollIntoView` keeps current line centered
- **Click handlers** - Each word is clickable for seeking

### Audio Controls (`src/components/AudioControls.tsx`)

Play button and progress slider with:
- Shadcn UI Slider component
- Time display (current / duration)
- Responsive sizing

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React meta-framework)
- **React**: 19.x with React Compiler
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (`motion` package)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Build Tool**: [Vite](https://vitejs.dev/) 7.x
- **Language**: TypeScript (strict mode)
- **Linting**: [Biome](https://biomejs.dev/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- bun, npm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/crafter-station/synced-lyrics-player.git
cd synced-lyrics-player

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Your Own Song

1. Replace `public/song/audio.mp3` with your audio file
2. Generate word-level timing data (see below) and save to `public/song/lyrics.json`
3. Update the song title in `src/routes/index.tsx`

#### Generating Lyrics Timing

You can use services like:
- [Whisper](https://github.com/openai/whisper) - OpenAI's speech recognition
- [AssemblyAI](https://www.assemblyai.com/) - API with word-level timestamps
- [Suno](https://suno.ai/) - If generating AI music, they provide lyrics timing

The JSON structure must match:
```typescript
interface LyricWord {
  text: string
  start: number  // seconds
  end: number    // seconds
  type: "word" | "spacing" | "audio_event"
}
```

## Project Structure

```
src/
├── components/
│   ├── AudioControls.tsx    # Play button + progress slider
│   ├── LyricsDisplay.tsx    # Main lyrics visualization
│   └── ui/                  # Shadcn UI components
├── hooks/
│   └── useAudioPlayer.ts    # Audio playback hook
├── lib/
│   ├── lyrics.ts            # Lyrics parsing & utilities
│   └── utils.ts             # Utility functions
├── routes/
│   ├── __root.tsx           # Root layout
│   └── index.tsx            # Main lyrics player page
└── styles.css               # Global Tailwind styles

public/
└── song/
    ├── audio.mp3            # The song audio
    └── lyrics.json          # Word-level timing data
```

## Scripts

```bash
bun dev       # Start dev server on port 3000
bun build     # Build for production
bun preview   # Preview production build
bun check     # Run Biome lint + format checks
bun test      # Run Vitest tests
```

## License

MIT
