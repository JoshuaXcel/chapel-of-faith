# Chapel of Faith – Frontend

The website for The Chapel of Faith, FUTA. It is built with **React** (draws the pages)
and **Vite** (runs and builds the project), and gets all its content from the FastAPI
backend in `../backend`.

## Run it on your computer

You need Node.js 20 or newer (`node -v` to check) and the backend running.

1. Start the backend (in another terminal) on port 8000:

   ```
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. Start the frontend:

   ```
   cd frontend
   npm install            # only the first time, or after package.json changes
   cp .env.example .env   # only the first time
   npm run dev
   ```

3. Open http://localhost:5173.

The backend must allow the frontend's address (CORS). By default it allows
`http://localhost:5173`. If you open the site on another address, add it to
`CORS_ORIGINS` in `backend/.env` (see `backend/.env.example`).

## Other commands

| Command           | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Runs the site with live reload while you edit                    |
| `npm test`        | Runs the tests in `src/tests/`                                   |
| `npm run lint`    | Checks the code for common mistakes (oxlint)                     |
| `npm run build`   | Builds the final site into `dist/` (this is what gets deployed)  |
| `npm run preview` | Serves the built `dist/` folder, to check it before deploying    |

## Folder map

```
frontend/
├── .env.example          Settings template. Copy to .env (VITE_API_URL = backend address)
├── index.html            The one HTML page. React draws everything inside <div id="root">
├── vite.config.js        Vite settings (and the test settings)
├── public/               Files served as they are (the favicon)
└── src/
    ├── main.jsx          Starting point: loads the CSS and puts <App /> on the page
    ├── App.jsx           The list of routes: which page shows for which URL
    ├── api.js            The ONLY file that talks to the backend (fetch, token, errors)
    ├── useFetch.js       A hook pages use to load data: { data, loading, error }
    ├── format.js         Turns backend dates into friendly text ("Sunday, 4 October 2026")
    ├── devotions.js      Picks today's devotion and hides future-dated ones
    ├── siteInfo.js       Church details (address, phone, social links) in one place
    ├── assets/           The crest image and the fonts
    ├── styles/
    │   ├── global.css    Design tokens (colours, fonts, spacing) + buttons, cards, forms
    │   └── public.css    Styles for the sections of the public pages
    ├── components/       Reusable pieces: Navbar, MobileMenu, Footer, Button, Card,
    │                     Photo, PageHeader, Loading, ErrorMessage, ProtectedRoute, ...
    ├── pages/            One file per public page: Home, About, Sermons, SermonDetail, ...
    │   └── admin/        The staff area: Login, AdminLayout (sidebar), Dashboard,
    │                     AdminEvents, AdminSermons, AdminDevotions, AdminLeadership,
    │                     AdminGallery, ImageUpload, admin.css
    └── tests/            Tests (Vitest + React Testing Library)
```

## How a page gets its data

```
Page component  ->  useFetch('/sermons')  ->  api.js get()  ->  backend GET /sermons
      ^                                                                  |
      └──────────── { data, loading, error } <──── JSON ─────────────────┘
```

1. A page such as `pages/Sermons.jsx` calls `useFetch('/sermons')`.
2. `useFetch` calls `get('/sermons')` from `api.js`.
3. `api.js` adds the backend address from `.env` (`VITE_API_URL`) and sends the request.
4. While waiting, `loading` is `true` and the page shows `<Loading />`.
5. When the answer arrives, the page shows the data. If it failed, `error` holds a
   readable message and the page shows `<ErrorMessage />`.

Images uploaded to the backend are saved as paths like `/media/abc.jpg`.
`mediaUrl()` in `api.js` turns them into full addresses
(`http://localhost:8000/media/abc.jpg`) so the browser can load them.

## How login works

1. A staff member opens `/admin`. `ProtectedRoute` sees there is no token and sends them to
   `/admin/login`.
2. The login form sends the email and password to `POST /auth/login`.
3. The backend answers with an `access_token`. `api.js` saves it in the browser's
   `localStorage`.
4. From then on, `api.js` adds `Authorization: Bearer <token>` to every request, so the
   admin pages can create, edit and delete content.
5. **Log out** (bottom of the sidebar) removes the token. If the token expires, the backend
   answers `401` and `api.js` logs out automatically, which sends the user back to the
   login page.

Admin accounts are created on the backend (there is no sign-up page).

## Not connected yet

The backend has no endpoints yet for prayer requests, contact messages, counselling
bookings or devotion email sign-ups. Those forms are shown, but switched off with a
"coming soon" note. When the endpoints exist, each form can send its data with `post()`
from `api.js`, the same way the admin forms do.

Also still to fill in (in `src/siteInfo.js` and `src/pages/Give.jsx`): the Chapel's email,
phone, WhatsApp number, social media links and bank details.
