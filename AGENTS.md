# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working on this Synced Lyrics Player project.

## Project Overview

A Spotify-like lyrics player that syncs audio with word-by-word highlighting.

- **Framework**: TanStack Start (React meta-framework built on TanStack Router)
- **Language**: TypeScript (strict mode)
- **Runtime**: Bun (preferred), Node.js compatible
- **Package Manager**: pnpm
- **Build Tool**: Vite 7.x
- **React Version**: 19.x with React Compiler
- **Animations**: Framer Motion (`motion` package)
- **Styling**: Tailwind CSS v4

## Commands

### Development

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Testing

```bash
pnpm test                        # Run all tests (vitest run)
pnpm vitest run <file>           # Run a single test file
pnpm vitest run <file> -t "name" # Run a specific test by name
pnpm vitest --watch              # Run tests in watch mode
```

### Linting & Formatting

```bash
pnpm lint         # Run Biome linter
pnpm format       # Run Biome formatter
pnpm check        # Run all Biome checks (lint + format)
```

To auto-fix issues:

```bash
pnpm biome check --write
```

## Architecture

### Core Components

| File | Purpose |
|------|---------|
| `src/routes/index.tsx` | Main lyrics player page, orchestrates all components |
| `src/components/LyricsDisplay.tsx` | Renders lyrics with word highlighting & animations |
| `src/components/AudioControls.tsx` | Play/pause button and progress slider |
| `src/hooks/useAudioPlayer.ts` | Custom hook for audio playback control |
| `src/lib/lyrics.ts` | Lyrics parsing, line splitting, timing utilities |

### Data Flow

```
lyrics.json → parseLyrics() → LyricsDisplay
                                    ↓
audio.mp3 → useAudioPlayer → currentTime → word highlighting
                    ↓
              AudioControls (play/pause/seek)
```

### Key Algorithms

**Line Splitting** (`src/lib/lyrics.ts`):
- Groups words into lines by sentence-ending punctuation (`.`, `!`, `?`)
- Handles ellipsis `...` as single unit
- Filters out `audio_event` types (`[singing]`, `[music]`)
- Calculates `gapBefore` for section spacing

**Word Highlighting** (`src/components/LyricsDisplay.tsx`):
- Word is active when `currentTime >= word.start`
- Uses Framer Motion `animate` for smooth color transitions
- Current line scales up with `scale: 1.15` (spring animation)
- Distance-based opacity: further lines fade out

## Code Style

### Formatting (Biome)

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for strings
- **Semicolons**: None (ASI)
- **Auto-organize imports**: Enabled via Biome

### TypeScript

- Strict mode enabled (`strict: true`)
- No unused locals or parameters
- Use `type` imports for type-only imports: `import type { Foo } from "bar"`
- Path alias: `@/*` maps to `./src/*`

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `LyricsDisplay`, `AudioControls` |
| Functions | camelCase | `parseLyrics`, `isWordActive` |
| Types/Interfaces | PascalCase | `LyricWord`, `LyricLine` |
| Hooks | camelCase with `use` prefix | `useAudioPlayer` |

### Import Order

1. Third-party libraries (`motion/react`, `react`)
2. Framework imports (`@tanstack/*`)
3. Local imports using `@/` alias
4. Type-only imports (last)

```typescript
import { motion } from "motion/react"
import { useEffect, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { AudioControls } from "@/components/AudioControls"
import { cn } from "@/lib/utils"

import type { LyricLine } from "@/lib/lyrics"
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
│   └── utils.ts             # Utility functions (cn)
├── routes/
│   ├── __root.tsx           # Root layout
│   └── index.tsx            # Main lyrics player page
├── router.tsx               # Router configuration
├── styles.css               # Global Tailwind styles
└── routeTree.gen.ts         # Auto-generated (DO NOT EDIT)

public/
└── song/
    ├── audio.mp3            # The song audio
    └── lyrics.json          # Word-level timing data
```

## Animation Guidelines

This project uses Framer Motion for smooth animations. Key patterns:

### Scale-based focus (not font-size)
```typescript
// Good - uses transform, no layout reflow
animate={{ scale: isCurrent ? 1.15 : 1 }}

// Bad - causes layout reflow
className={isCurrent ? "text-2xl" : "text-lg"}
```

### Spring physics for natural feel
```typescript
transition={{
  scale: { type: "spring", stiffness: 300, damping: 30 },
  layout: { type: "spring", stiffness: 300, damping: 30 },
}}
```

### Color transitions for word highlighting
```typescript
<motion.span
  animate={{
    color: shouldHighlight ? "#ffffff" : "#71717a",
    textShadow: isActive ? "0 0 8px rgba(255,255,255,0.4)" : "none",
  }}
  transition={{ duration: 0.15, ease: "easeOut" }}
>
```

## Responsive Design

Use Tailwind's responsive prefixes:

```typescript
// Mobile-first approach
className="text-base sm:text-lg md:text-xl lg:text-2xl"
className="pt-4 sm:pt-8"
className="size-12 sm:size-16"
```

Breakpoints:
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+

## Important Notes

1. **DO NOT EDIT** `src/routeTree.gen.ts` - it's auto-generated
2. **DO NOT EDIT** `src/styles.css` directly for component styles - use Tailwind classes
3. Run `pnpm check` before committing to catch lint/format issues
4. Use the `@/` path alias for all local imports
5. The lyrics data structure must match `LyricWord` interface in `src/lib/lyrics.ts`
