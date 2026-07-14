# The Mask That Frees — Vercel Deployment Guide 🍉

This version makes visitor-added fruits **shared with everyone and persistent across refreshes**.
Fruit data is stored in Upstash Redis (free tier).

## Folder structure
```
index.html        <- the full website (home / interactive / findings / resources / about)
api/fruits.js     <- serverless API for saving & deleting fruits
package.json      <- @upstash/redis dependency
```

## How to deploy (about 5 minutes)

### 1. Push to GitHub
Upload this folder to a new GitHub repository.
(Or install the CLI with `npm i -g vercel` and run `vercel` inside this folder.)

### 2. Create the Vercel project
- Go to vercel.com -> **Add New... -> Project** -> import the repository you just made
- No settings to change — just hit **Deploy**

### 3. Connect Upstash Redis (the fruit storage)
- In the deployed project's dashboard, open the **Storage** tab
- Choose **Upstash (Redis)** -> create a database on the **Free** plan
- **Connect** it to this project — the credentials are added as environment variables automatically

### 4. Redeploy
- So the environment variables take effect: **Deployments tab -> latest deployment -> ... -> Redeploy**

### 5. Verify
- Open `https://your-site.vercel.app/api/fruits` — if you see `{"fruits":[]}`, it works!
- Add a fruit on the Interactive page, refresh, and confirm it's still there.

## Notes
- Up to 20 fruits are stored (so the box doesn't get crowded) — adjust `MAX_FRUITS` in `api/fruits.js`
- Anyone can remove a fruit (tap a fruit -> remove) — this is intentional!
- If Redis isn't connected yet or the server has an issue, the site gracefully falls back to "this visit only" mode instead of breaking
