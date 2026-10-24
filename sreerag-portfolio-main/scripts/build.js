const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function cleanAndCreateDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(srcRel, destRel = srcRel) {
  const srcPath = path.join(ROOT, srcRel);
  const destPath = path.join(DIST, destRel);
  if (!fs.existsSync(srcPath)) {
    console.warn(`[WARN] Source file does not exist: ${srcRel}`);
    return;
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
}

function copyDir(srcRel, destRel = srcRel, filterFn = null) {
  const srcPath = path.join(ROOT, srcRel);
  const destPath = path.join(DIST, destRel);
  if (!fs.existsSync(srcPath)) return;

  fs.mkdirSync(destPath, { recursive: true });
  const entries = fs.readdirSync(srcPath, { withFileTypes: true });

  for (const entry of entries) {
    const srcEntryPath = path.join(srcPath, entry.name);
    const relPath = path.join(srcRel, entry.name).replace(/\\/g, '/');

    if (filterFn && !filterFn(relPath, entry)) {
      continue;
    }

    const destEntryPath = path.join(destPath, entry.name);
    if (entry.isDirectory()) {
      copyDir(relPath, path.join(destRel, entry.name).replace(/\\/g, '/'), filterFn);
    } else {
      fs.copyFileSync(srcEntryPath, destEntryPath);
    }
  }
}

// Share crawlers (LinkedIn, WhatsApp, X, Slack) need ABSOLUTE URLs for og:image, so the
// canonical link and share-image tags are added here once the site's public address is known.
// Set it in src/data/portfolio.js (siteUrl) or with the SITE_URL environment variable.
function resolveSiteUrl() {
  let siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    try {
      siteUrl = require(path.join(ROOT, 'src/data/portfolio.js')).siteUrl;
    } catch (err) {
      console.warn(`[WARN] Could not read siteUrl from src/data/portfolio.js: ${err.message}`);
    }
  }
  siteUrl = String(siteUrl || '').trim().replace(/\/+$/, '');
  if (siteUrl && !/^https?:\/\/[^\s"'<>]+$/.test(siteUrl)) {
    console.warn(`[WARN] Ignoring invalid site URL "${siteUrl}". Use something like https://example.pages.dev`);
    return '';
  }
  return siteUrl;
}

function injectSeoTags() {
  const htmlPath = path.join(DIST, 'index.html');
  const marker = '<!--SEO_URLS-->';
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (!html.includes(marker)) {
    console.warn('[WARN] index.html has no SEO_URLS marker; skipped canonical and share-image tags.');
    return;
  }

  const siteUrl = resolveSiteUrl();
  let tags = '';
  if (siteUrl) {
    const image = `${siteUrl}/public/assets/og-image.jpg`;
    tags = [
      `<link rel="canonical" href="${siteUrl}/">`,
      `<meta property="og:url" content="${siteUrl}/">`,
      `<meta property="og:image" content="${image}">`,
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      '<meta property="og:image:alt" content="Portrait of Sreerag Rajeevan in red cinematic lighting">',
      `<meta name="twitter:image" content="${image}">`
    ].join('\n  ');
    console.log(`==> Added canonical link and share image for ${siteUrl}`);
  } else {
    console.warn('[WARN] No site URL set: the build has NO canonical link and NO share-preview image.');
    console.warn('       Set siteUrl in src/data/portfolio.js or run with SITE_URL=https://your-site.example');
  }
  fs.writeFileSync(htmlPath, html.replace(marker, tags));
}

console.log('==> Building production site for Cloudflare Pages...');
cleanAndCreateDir(DIST);

// 1. Core web pages and styles
copyFile('index.html');
injectSeoTags();
copyFile('style.css');
copyFile('script.js');
copyFile('favicon.svg');
copyFile('apple-touch-icon.png');

// 2. Data files required by index.html
copyFile('src/data/portfolio.js');

// 3. Canvas sequence frames (Hero background - optimized lightweight WebPs)
console.log('==> Copying canvas sequence frames...');
copyDir('tempp', 'tempp', (rel, entry) => {
  if (entry.isDirectory()) return true;
  return entry.name.endsWith('.webp');
});

// Cache rules for Cloudflare Pages (served from the root of dist/)
copyFile('_headers');
copyFile('vercel.json');

// 4. Showreel video & poster
console.log('==> Copying showreel assets...');
copyDir('showreel');

// 5. Public assets (Portrait, Posters)
console.log('==> Copying public assets...');
copyDir('public/assets/portrait');
copyDir('public/assets/posters');
copyFile('public/assets/og-image.jpg');

// 6. Active AI videos and thumbnails used by the site
const ACTIVE_VIDEOS = [
  'aidora-perfume.mp4',
  'aidora-perfume-thumb.webp',
  'kick-and-splash.mp4',
  'kick-and-splash-thumb.webp',
  'aida-travels-1.mp4',
  'aida-travels-1-thumb.webp',
  'aida-travels-2.mp4',
  'aida-travels-2-thumb.webp',
  'showreel-poster.svg'
];

copyDir('public/assets/videos', 'public/assets/videos', (relPath, entry) => {
  if (entry.isDirectory()) return true;
  return ACTIVE_VIDEOS.includes(entry.name);
});

console.log('==> Build completed successfully! Output directory: dist/');
