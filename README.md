#  Music App

A Spotify-like music streaming platform built with a **decoupled architecture**:
a React + TypeScript frontend and a Node.js + Express backend, sharing types
via a monorepo.

>  **Legal note:** This project streams only royalty-free, Creative Commons,
> or user-uploaded audio. It does **not** stream commercial/copyrighted music.
> See [Legal & Licensing](#-legal--licensing) below.

---

##  Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Architecture Overview](#-architecture-overview)
- [Roadmap](#-roadmap)
- [Legal & Licensing](#-legal--licensing)
- [License](#-license)

---

##  Tech Stack

### Frontend (`client/`)
| Tool | Purpose |
|------|---------|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **TypeScript** | Type safety |
| **React Router** | Client-side routing |
| **Zustand** | Global state (player, auth) |
| **Axios** | HTTP client |
| **Tailwind CSS** | Styling |

### Backend (`server/`)
| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime |
| **Express** | HTTP framework |
| **TypeScript** | Type safety |
| **Prisma** | ORM + migrations |
| **PostgreSQL** | Database |
| **JWT + bcrypt** | Auth |
| **Zod** | Request validation |
| **Multer** | File uploads |

### Shared (`shared/`)
- TypeScript type definitions (`Track`, `User`, `Playlist`, API contracts)
- Imported by both client and server to keep them in sync.

### Infrastructure
- **Storage:** Cloudflare R2 / AWS S3 / Supabase Storage (audio files)
- **Deploy:** Client → Vercel · Server → Render/Railway/Fly.io · DB → Neon/Supabase

---

##  Project Structure

```
music-app/
├── client/                  # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── store/           # Zustand stores (player, auth)
│   │   ├── lib/             # API client, helpers
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                  # Node + Express + TypeScript backend
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── lib/             # Prisma client, JWT, storage helpers
│   │   └── index.ts         # App entry point
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                  # Shared TypeScript types
│   ├── src/
│   │   └── types.ts
│   └── package.json
│
├── package.json             # Root workspace config
├── .gitignore
└── README.md
```

---

##  Prerequisites

Make sure you have installed:

- **Node.js** ≥ 20 ([download](https://nodejs.org/))
- **npm** ≥ 10 (comes with Node)
- **PostgreSQL** ≥ 15 — or use a hosted DB (Neon, Supabase)
- **Git**

Verify:
```bash
node -v   # v20.x or higher
npm -v    # v10.x or higher
```

---

##  Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url> music-app
cd music-app
```

### 2. Install all dependencies
Because this is an npm workspace, one command installs everything:
```bash
npm install
```

### 3. Set up environment variables
Copy the example files and fill in your values:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
See [Environment Variables](#-environment-variables) for what each one does.

### 4. Set up the database
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 5. Run both apps in dev mode
From the repo root:
```bash
npm run dev
```
- Frontend → http://localhost:5173
- Backend  → http://localhost:4000

Health check: http://localhost:4000/api/health should return `{ "ok": true }`.

---

##  Environment Variables

### `server/.env`
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `CLIENT_URL` | Frontend origin (for CORS) | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/music` |
| `JWT_SECRET` | Secret for signing tokens | *(long random string)* |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `STORAGE_ENDPOINT` | S3/R2 endpoint | `https://<account>.r2.cloudflarestorage.com` |
| `STORAGE_BUCKET` | Bucket name | `music-audio` |
| `STORAGE_ACCESS_KEY` | Access key | *(from provider)* |
| `STORAGE_SECRET_KEY` | Secret key | *(from provider)* |

### `client/.env`
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend | `http://localhost:4000/api` |

> **Note:** Vite only exposes variables prefixed with `VITE_` to the browser.
> Never put secrets in `client/.env`.

---

##  Available Scripts

### Root
| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run build` | Build shared → server → client |
| `npm run lint` | Lint the whole repo |

### `client/`
| Command | Description |
|---------|-------------|
| `npm run dev -w client` | Vite dev server |
| `npm run build -w client` | Production build |
| `npm run preview -w client` | Preview production build |

### `server/`
| Command | Description |
|---------|-------------|
| `npm run dev -w server` | Express with hot reload (`tsx watch`) |
| `npm run build -w server` | Compile TypeScript → `dist/` |
| `npm run start -w server` | Run compiled output |

---

##  Architecture Overview

```
┌─────────────────────┐        HTTP / JSON        ┌─────────────────────┐
│   Browser (client)  │  ───────────────────────► │  Express (server)   │
│   React + Vite      │  ◄─────────────────────── │  Node + TypeScript  │
│   :5173             │        CORS enabled        │  :4000              │
└─────────────────────┘                            └──────────┬──────────┘
                                                              │
                                                              │ Prisma
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │    PostgreSQL       │
                                                   └─────────────────────┘

              Audio files live in object storage (R2/S3/Supabase),
              served via presigned URLs — NOT proxied through Node.
```

### Key principles
1. **Client and server are separate processes.** They talk only over HTTP.
2. **Types are shared** via `shared/` so both sides stay in sync at compile time.
3. **Audio bytes bypass the backend.** Files are uploaded to object storage;
   the server issues presigned URLs. This keeps Node fast and cheap.
4. **Auth is stateless.** JWT in `Authorization: Bearer <token>` headers.

---

##  Roadmap

- [x] Project scaffolding & README
- [ ] Monorepo skeleton + shared types
- [ ] Prisma schema (users, tracks, playlists, playlist_tracks)
- [ ] Auth: register / login / JWT middleware
- [ ] Track upload (Multer → object storage) + listing
- [ ] Global audio player (Zustand + single `<audio>` element)
- [ ] Playlists CRUD + add/remove tracks
- [ ] Search by title / artist
- [ ] Deploy to production

### Stretch goals
- [ ] Lyrics sync
- [ ] Recommendations (by genre / listening history)
- [ ] PWA + offline mode
- [ ] Social features (follow, share)

---

##  Legal & Licensing

This project is a **learning/portfolio piece**. It must not be used to stream
copyrighted music without proper licenses.

**Allowed audio sources:**
- User-uploaded content (with DMCA compliance)
- Creative Commons / royalty-free libraries:
  [Jamendo](https://developer.jamendo.com/), [Free Music Archive](https://freemusicarchive.org/), [Pixabay Music](https://pixabay.com/music/)
- Your own original recordings

**Not allowed:**
- Ripping or streaming music from Spotify, Apple Music, YouTube, etc.
- Using Spotify's Web Playback SDK as a streaming backend (violates their ToS).

---

##  License

MIT — see [LICENSE](./LICENSE) *(add one before publishing)*.