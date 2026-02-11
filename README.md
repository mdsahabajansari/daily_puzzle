# Daily Puzzle — Logic Game 🧩

A production-grade, offline-first daily puzzle web app built with React 18, Vite, Tailwind CSS, and TypeScript.

## Features

- **5 Daily Puzzles** — Logic, Math, Pattern, Sequence, and Memory challenges
- **Streak Tracking** — GitHub-style heatmap with daily streak counter
- **Offline-First** — Full PWA support, works without internet
- **Scoring System** — Speed bonuses, hint penalties, and streak multipliers
- **Firebase Auth** — Google Sign-In with Truecaller option for mobile
- **Beautiful UI** — Glassmorphism design, Framer Motion animations, dark theme

## Quick Start

### Prerequisites

- Node.js 18+ and npm installed
- A Firebase project (for authentication)
- (Optional) A Neon.tech PostgreSQL database

### Setup

```bash
# 1. Clone and navigate to the project
cd project1

# 2. Copy the environment template
cp .env.example .env

# 3. Fill in your Firebase credentials in .env
#    Get these from Firebase Console → Project Settings

# 4. Install dependencies
npm install

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `DATABASE_URL` | Neon.tech PostgreSQL connection string |
| `VITE_TRUECALLER_APP_KEY` | Truecaller app key (optional) |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── app/                 # Root App component and routing
├── components/          # Shared UI components (Layout, Spinner)
├── engine/              # Puzzle generation and validation
│   ├── generator.ts     # Date-seeded puzzle generator (5 types)
│   ├── validator.ts     # Answer validation and scoring
│   └── puzzleEngine.ts  # Orchestrator with caching
├── features/
│   ├── auth/            # Firebase auth (Google + Truecaller)
│   ├── puzzles/         # Puzzle gameplay UI
│   ├── streak/          # Streak tracking and heatmap
│   └── scoring/         # Score calculation and display
├── hooks/               # Custom React hooks
├── services/            # Auth, sync, and analytics services
├── storage/             # IndexedDB + compression layer
├── tests/               # Unit tests
└── utils/               # Date helpers and utilities
```

## Deployment to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
#    (same variables from .env.example)
```

The `vercel.json` is pre-configured with SPA rewrites and cache headers.

## Database Setup (Neon.tech)

1. Create a database at [neon.tech](https://neon.tech)
2. Run `schema.sql` against your database to create tables
3. Add the connection string to your `.env` as `DATABASE_URL`

## Architecture Highlights

- **Offline-First**: All puzzles are generated client-side using a deterministic PRNG. The same date always produces the same puzzles.
- **3-Tier Caching**: Memory → IndexedDB → Generate. Puzzles are prefetched 7 days ahead.
- **Batched Sync**: Progress syncs to server every 5 completions (not every action) to minimize API calls.
- **LZ Compression**: Puzzle data is compressed before saving to IndexedDB.
- **Code Splitting**: React, Framer Motion, Firebase, and state management are in separate chunks.

## License

MIT
# daily_puzzle
