# Live Ark Export — website

Single-page static site: `index.html`, `css/styles.css`, `js/main.js`, plus `images/`, `media/` and `js/vendor/`.
No build step. The animation libraries (GSAP 3.13 with ScrollTrigger and SplitText, and Lenis smooth scroll) are self-hosted in `js/vendor/`, so the site has no CDN dependency.

## One-time setup: contact form

The form sends email through [Web3Forms](https://web3forms.com), which is free and needs no server.

1. Open https://web3forms.com, enter `contact@livearkexports.co.uk`, and click **Create Access Key**.
2. Copy the key from the email you receive.
3. In `js/main.js`, replace `YOUR_WEB3FORMS_ACCESS_KEY` on line 6 with that key.

Until you do this, the form shows a message asking visitors to email you directly.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

## Deploy (free)

- **Netlify:** drag this folder onto https://app.netlify.com/drop.
- **Cloudflare Pages / GitHub Pages:** push the folder to a repository and enable Pages. The publish directory is the root.

If the final domain is not `livearkexports.co.uk`, update it in `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `robots.txt`, and `sitemap.xml`.

After editing CSS or JS, bump the `?v=` number on its `<link>` or `<script>` tag in `index.html` so returning visitors get the new file.

## How the moving ship works

The ship and its dotted sea route are drawn by `voyage` in `js/main.js`. The route is built from every element marked `data-sea`. Inside each one, the route keeps to a side margin next to the `data-sea-content` box. In the gaps between sections it sweeps across to the other side. To change where the ship travels, add or remove `data-sea` on a section.

## Editing content

- **Vessels:** each vessel is one `<li class="vessel">` in the fleet section of `index.html`. Its photo is in `images/vessels/`. The first three spec rows show on the card; all rows appear in the "Full specifications" drawer.
- **Hero background:** `media/hero-cattle.mp4`, with `images/brand/hero-poster.jpg` shown before the video loads.
- **Motion:** visitors with "reduce motion" switched on get a static version, with no smooth scrolling, pinning or text animations.
