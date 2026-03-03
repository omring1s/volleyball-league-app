# VBLeague

A full-stack web app for managing local recreational volleyball leagues. Create and join leagues, schedule games, organize pickup game invites, and share equipment with other players.

## Features

- **Leagues** — Create leagues, set skill level and season dates, join/leave, view members
- **Game Scheduling** — Admins can schedule games, enter final scores, and track standings
- **Invites** — Create shareable pickup game invites with a public RSVP link (no account required to RSVP)
- **Equipment** — List volleyball gear, reserve items for time slots with conflict detection
- **Profiles** — View player profiles, skill levels, and league history. Edit your own profile.
- **Auth** — JWT-based register/login, stays logged in across page refreshes

## Tech Stack

**Backend**
- Node.js + Express
- SQLite via `node:sqlite` (built-in, Node 22+)
- JWT authentication + bcrypt password hashing

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v3
- Axios

## Getting Started

### Prerequisites
- Node.js v22 or higher
- npm

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/omring1s/volleyball-league-app.git
   cd volleyball-league-app
   ```

2. Install all dependencies
   ```bash
   npm run install:all
   ```

3. Create the server environment file
   ```bash
   cp server/.env.example server/.env
   ```
   Or create `server/.env` manually:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key_here
   ```

4. Start the development servers
   ```bash
   npm run dev
   ```

The app will be available at **http://localhost:3000**

## Project Structure

```
volleyball-league-app/
├── package.json          # Root — concurrently dev script
├── server/
│   ├── server.js         # Express entry point
│   ├── db.js             # SQLite connection + schema
│   ├── middleware/       # Auth (JWT) + error handler
│   └── routes/           # auth, leagues, games, invites, equipment, users
└── client/
    ├── src/
    │   ├── pages/        # Full page components
    │   ├── components/   # Reusable UI + feature components
    │   ├── context/      # Auth context
    │   ├── hooks/        # useAuth, useDebounce
    │   └── api/          # Axios instance with auth interceptor
    └── vite.config.js    # Proxies /api → localhost:5000
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/leagues` | List leagues (filterable) |
| POST | `/api/leagues` | Create a league |
| POST | `/api/leagues/:id/join` | Join a league |
| GET | `/api/leagues/:id/games` | Get games for a league |
| POST | `/api/invites` | Create a pickup game invite |
| POST | `/api/invites/:id/rsvp` | RSVP (no auth required) |
| GET | `/api/equipment` | List equipment |
| POST | `/api/equipment/:id/reserve` | Reserve equipment |
