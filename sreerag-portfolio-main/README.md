# Sreerag Rajeevan — VFX Portfolio

Static portfolio site for Sreerag Rajeevan, Senior Matchmove & Rotoanim Artist and AI Filmmaker.
Plain HTML, CSS and JavaScript with no framework and no dependencies.

## Run it

| Command | What it does |
| --- | --- |
| `npm start` | Serves the site from the repo root at http://localhost:3000 (set `PORT` to change it) |
| `npm run build` | Copies only the files the site uses into `dist/` for deployment |
| `npm run preview` | Serves `dist/` so you can check exactly what will be deployed |

## Where things live

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure and static copy (hero, about, reel, contact) |
| `style.css` | All styling |
| `script.js` | Hero scroll animation, modals, filters, contact form |
| `src/data/portfolio.js` | Experience, filmography, AI works and tools. Most content edits happen here |
| `tempp/` | Hero scroll animation: 121 frames named `sree.0001.webp` to `sree.0121.webp`. `tempp/m/` holds the phone version (see Hero frames) |
| `showreel/` | The VFX showreel video |
| `public/assets/posters/` | Film posters, one per project in `portfolio.js` |
| `public/assets/videos/` | AI work videos and their thumbnails, plus the showreel poster |
| `public/assets/portrait/` | Portrait still. Source for the share-preview image |
| `public/assets/og-image.jpg` | 1200x630 share-preview image shown when the link is posted on LinkedIn, WhatsApp or X |
| `favicon.svg`, `apple-touch-icon.png` | Browser tab icon and iPhone home-screen icon |
| `scripts/build.js` | The build script behind `npm run build` |
| `scripts/make-frames.py` | Rebuilds every hero frame (`tempp/` and `tempp/m/`) from the source video |
| `_headers`, `vercel.json` | Caching rules for Cloudflare Pages and Vercel (same rules, keep them in step) |
| `server.js` | Small Node server for local use and `npm run preview` |

## Common edits

**Add a project.** Add a poster image to `public/assets/posters/` (2:3 portrait, about 800x1200, JPG or WebP), then add an entry to `projects.items` in `src/data/portfolio.js` with its `poster` path. If it is under a new studio, also add the studio name to `projects.studios`.

**Add an AI work.** Put the MP4 and a thumbnail in `public/assets/videos/`, add an entry to `aiWorks.items`, and add both filenames to `ACTIVE_VIDEOS` in `scripts/build.js`. Files not listed there are left out of the build.

**Change contact details.** The email address appears in three places: `index.html`, `script.js` (`TARGET_EMAIL`) and `src/data/portfolio.js`. Update all three.

**Replace the showreel.** Overwrite `showreel/sreerag_showreel_2024.mp4`.

## Contact form

Until a form service is configured, "Get in Touch" only opens the visitor's email app with a draft, so the site itself sends nothing. To have messages arrive in the inbox directly:

1. Create a free account with Formspree or Web3Forms and make a form that delivers to Sreerag's email.
2. In `src/data/portfolio.js`, under `contact`, set `formEndpoint`. For Formspree use `https://formspree.io/f/<your form id>`. For Web3Forms use `https://api.web3forms.com/submit` and also set `formAccessKey` to the public key they give you.
3. Rebuild, deploy, and send yourself a test message.

These two values are public by design (they can only send mail to that one inbox), so they are safe to keep in the repo. A hidden field catches simple spam bots. If the service is down, the visitor sees an error with a direct email link and keeps what they typed.

## Share previews

Link previews need an absolute image address, so the build adds them only once it knows the site's address. Set `siteUrl` in `src/data/portfolio.js` (for example `https://sreerag.pages.dev`, no trailing slash), or set a `SITE_URL` environment variable in the Cloudflare Pages build settings. Without it the build prints a warning and leaves out the canonical link and the preview image.

To change the picture, replace `public/assets/og-image.jpg` (1200x630). LinkedIn and WhatsApp cache previews, so an old one can stay visible for a while after a change.

## Accessibility

Clickable cards are `<div role="button" tabindex="0">`, and the `onActivate` helper in `script.js` makes Enter and Space work on them. New cards should follow the same pattern. The modal traps keyboard focus, makes the page behind it `inert`, and returns focus to the card that opened it. Visitors who ask their system for reduced motion get one still hero frame, no hover video previews and no CSS transitions. Keep text at 0.75rem (12px) or larger.

## Hero frames

Frames start downloading as soon as the page loads, in a coarse-to-fine order (last frame, then every 16th, 8th, 4th, 2nd, then the rest), so scrolling early shows a rougher animation rather than a frozen picture.

Phones held upright download `tempp/m/`: every 2nd frame, cropped to the slice a portrait screen shows. Everything else uses the full frames. If you replace the frames in `tempp/`, do two things: run `python3 scripts/make-frames.py path/to/source.mp4` (needs ffmpeg and `pip install pillow`; it rebuilds both `tempp/` and `tempp/m/` from the original video) and bump `FRAME_VERSION` in `script.js` and the `?v=` in the two `<link rel="preload">` tags in `index.html`. Frames are cached for a year, and a new version number is what makes returning visitors fetch the new ones.

## Deploying

The live site is on Vercel (https://www.sreeragrajeevan.in); the build also works on Cloudflare Pages, which rejects any single file over 25 MiB. Keep every video under that. Encode as H.264 MP4 with the `faststart` flag so playback starts before the download finishes:

```
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 24 -c:a aac -b:a 96k -movflags +faststart output.mp4
```

Run `npm run build`, then publish the `dist/` folder. The build copies `_headers`, which tells Cloudflare to cache hero frames for a year and keep the page, script and stylesheet always fresh.
