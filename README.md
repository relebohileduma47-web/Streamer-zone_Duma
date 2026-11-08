# Creator Hub: Content Creator Management and Viewer Engagement App

MERN application (React 18 + Create React App, Node/Express, MongoDB Atlas) for DIWP3110 Practical Test.

- **Viewer Portal** (public): home page, content listing, details, search, category filter, likes, comments, view count, share link.
- **Creator Dashboard** (private, JWT login): stats, add/edit/delete content, draft/published/scheduled, categories, comment moderation, profile.

```
content-creator-app/
  server/   Express API + Mongoose models
  client/   React frontend (Create React App, no Vite)
```

## 1. Run locally

**Prerequisites:** Node 18+, a MongoDB Atlas cluster (see section 3).

```bash
# Backend
cd server
npm install
cp .env.example .env        # then edit .env (MONGO_URI, JWT_SECRET, ADMIN_*)
npm run dev                 # http://localhost:5000/api/health

# Optional: add sample content
npm run seed

# Frontend (new terminal)
cd client
npm install
cp .env.example .env        # REACT_APP_API_URL=http://localhost:5000
npm start                   # http://localhost:3000
```

The creator account is created automatically on first server start from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (the password is hashed with bcrypt before it is stored). Sign in at `/login`.

## 2. Environment variables

| File | Variable | Purpose |
|---|---|---|
| server/.env | `PORT` | Port (Render sets this itself) |
| | `MONGO_URI` | Atlas connection string |
| | `JWT_SECRET` | Long random string used to sign tokens |
| | `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| | `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated |
| | `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Creator account created on first start |
| client/.env | `REACT_APP_API_URL` | Backend base URL (no trailing slash) |

Never commit `.env` files (they are in `.gitignore`).

## 3. MongoDB Atlas

1. Create a free account and an **M0** cluster at https://www.mongodb.com/atlas.
2. **Database Access** > Add a database user (username + password). Avoid special characters in the password, or URL-encode them.
3. **Network Access** > Add IP address > `0.0.0.0/0` (needed because Render's IPs change).
4. **Connect** > Drivers > copy the connection string, replace `<password>`, and add the database name before the `?`:
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/content_creator?retryWrites=true&w=majority`
5. Collections (`users`, `contents`, `comments`, `likes`, `viewers`) are created automatically on first use.

## 4. Deploy

Push the project to GitHub first (`git init`, commit, add remote, push). Deploy the backend first, because the frontend needs its URL.

### Backend on Render
1. New > **Web Service** > connect your GitHub repo.
2. Root Directory: `server`. Build Command: `npm install`. Start Command: `npm start`.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_URL` (set a placeholder now, update after step below).
4. Deploy, then open `https://<your-service>.onrender.com/api/health`.
   The free tier sleeps after inactivity, so the first request can take about a minute.

### Frontend on Vercel
1. New Project > import the same repo. Root Directory: `client`. Framework preset: **Create React App**.
2. Environment variable: `REACT_APP_API_URL` = your Render URL (no trailing slash).
3. Deploy. `client/vercel.json` makes page refreshes work on routes like `/browse`.

(Netlify alternative: base directory `client`, build command `npm run build`, publish directory `client/build`. `public/_redirects` is already included.)

### Connect them
Go back to Render > Environment and set `CLIENT_URL` to your Vercel URL (e.g. `https://creator-hub.vercel.app`, no trailing slash). Save; Render redeploys. Then test everything on the public URL.

## 5. API summary

| Method | Endpoint | Access | Function |
|---|---|---|---|
| POST | /api/auth/login | public | Creator login, returns JWT |
| GET | /api/auth/me | creator | Current creator |
| GET | /api/contents?q=&category=&featured=&page=&limit= | public | Published content (scheduled items appear once their date passes) |
| GET | /api/contents/manage/all?status=&q= | creator | All content including drafts |
| GET | /api/contents/:id | public (live) / creator (any) | One content item |
| POST | /api/contents/:id/view | public | Record a view |
| POST | /api/contents | creator | Add content |
| PUT | /api/contents/:id | creator | Update content |
| DELETE | /api/contents/:id | creator | Delete content, its comments and likes |
| POST | /api/comments | public | Submit a comment (display name + text) |
| GET | /api/comments/:contentId | public | Approved comments |
| GET | /api/comments?status= | creator | All comments for moderation |
| PATCH | /api/comments/:id/status | creator | Approve / hide / set pending |
| DELETE | /api/comments/:id | creator | Delete comment |
| POST | /api/likes | public | Toggle like (one per viewer per content) |
| GET | /api/likes/:contentId?viewerId= | public | Like count and whether this viewer liked |
| GET | /api/dashboard/stats | creator | Dashboard statistics |
| GET / PUT | /api/profile | public / creator | Creator profile |

## 6. Design decisions (useful for your viva)

- **Scheduling without cron:** a scheduled item stores a future `publishDate`. Public queries only return items whose `publishDate` is in the past, so they go live automatically.
- **Likes without viewer registration:** the browser generates an anonymous `viewerId` (saved in localStorage). A unique index on `content + viewerId` stops duplicate likes. These ids are also stored in the `viewers` collection.
- **Comment moderation:** by default comments appear immediately and the creator can hide or delete them. Tick "Hold new comments for my approval" on the Profile page to make new comments `pending` until approved.
- **Security:** bcrypt password hashing (cost 12), JWT in the `Authorization` header, a `protect` middleware on every creator route, secrets only in environment variables, CORS limited to `CLIENT_URL`, input validated with express-validator and again by Mongoose schemas, whitelisted fields on create/update.
- **Content is XSS-safe:** all user text is rendered as plain React text (no `dangerouslySetInnerHTML`).

## 7. Marking guide checklist

- Viewer Portal (20): `client/src/pages/public/*`
- Creator Dashboard (20): `client/src/pages/creator/*`
- Database (15): `server/models/*`, `server/config/db.js`
- Backend/API (15): `server/routes/*`, `server/controllers/*`
- Engagement (10): likes, comments, views, share, moderation
- Auth and security (10): `server/middleware/auth.js`, `server/models/User.js`
- Hosting (10): section 4. Submit your GitHub link and the public Vercel URL.
