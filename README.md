# LILA Tic-Tac-Toe - Frontend

React frontend for multiplayer Tic-Tac-Toe.

## Prerequisites

- **Node.js 20+**
- **GitHub Account**
- **Netlify Account** (free) - [netlify.com](https://netlify.com)
- **Deployed Backend** - Deploy the backend to Render.com first!

## Project Structure

```
/frontend
├── /src
│   ├── /components         # React components
│   │   ├── Board.tsx       # 3x3 game board
│   │   ├── Cell.tsx        # Individual cell
│   │   ├── Timer.tsx       # Countdown timer
│   │   ├── Leaderboard.tsx # Rankings display
│   │   └── ...
│   ├── /contexts
│   │   └── NakamaContext.tsx  # Nakama client state
│   ├── /hooks
│   │   ├── useNakama.ts    # Nakama connection hook
│   │   └── useMatch.ts     # Match state hook
│   ├── /pages
│   │   ├── Home.tsx        # Nickname entry
│   │   ├── Lobby.tsx       # Mode selection
│   │   ├── Game.tsx        # Active game
│   │   └── Results.tsx     # Post-game screen
│   ├── /types
│   │   └── game.ts         # TypeScript types
│   └── /utils
│       └── nakama.ts       # Nakama client setup
├── netlify.toml            # Netlify configuration
├── .env.example            # Environment variables template
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Deploy to Netlify

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/lila-frontend.git
git push -u origin main
```

### Step 2: Create Netlify Site

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**

### Step 3: Configure Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_NAKAMA_HOST` | `lila-nakama.onrender.com` | Your Render backend URL (no https://) |
| `VITE_NAKAMA_PORT` | `443` | HTTPS port |
| `VITE_NAKAMA_USE_SSL` | `true` | Enable SSL |
| `VITE_NAKAMA_SERVER_KEY` | `defaultkey` | Nakama server key |

**Important**: Replace `lila-nakama.onrender.com` with your actual Render backend URL!

### Step 4: Redeploy

1. Go to **Deploys**
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## Verify Deployment

1. Open your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Enter a nickname
3. Open another browser/incognito tab with the same URL
4. Enter a different nickname
5. Both click "Find Match"
6. Play!

## Local Development (Optional)

If you want to run locally (requires backend running):

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_NAKAMA_HOST=localhost
VITE_NAKAMA_PORT=7350
VITE_NAKAMA_USE_SSL=false
VITE_NAKAMA_SERVER_KEY=defaultkey
```

### Step 3: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

## Environment Variables Reference

| Variable | Description | Local | Production |
|----------|-------------|-------|------------|
| `VITE_NAKAMA_HOST` | Nakama server hostname | `localhost` | Your Render URL |
| `VITE_NAKAMA_PORT` | Nakama server port | `7350` | `443` |
| `VITE_NAKAMA_USE_SSL` | Use HTTPS/WSS | `false` | `true` |
| `VITE_NAKAMA_SERVER_KEY` | Server key | `defaultkey` | `defaultkey` |

## Troubleshooting

### "Failed to connect to server"
- Make sure the backend is deployed and running on Render.com
- Verify `VITE_NAKAMA_HOST` doesn't include `https://`
- Ensure `VITE_NAKAMA_USE_SSL` is set to `true`

### "WebSocket connection failed"
- Verify port is `443` for production
- Check browser console for specific errors

### Slow first load
- Render.com free tier spins down after 15 minutes of inactivity
- First request wakes the server (30-60 seconds)
- Subsequent requests are fast

### Game not starting
- Make sure two different browsers/tabs are connected
- Both players must click "Find Match"
- Check if matchmaking is working in Nakama console
