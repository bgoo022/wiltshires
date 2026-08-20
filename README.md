# Goodwin Wiltshires Website

A lightweight, zero-build static website for Goodwin Wiltshires.

## Why it is plain HTML/CSS/JS

This site is deliberately framework-free. For a small stud website it is faster, easier to maintain, and cheaper to host than a server-rendered app. There is no database, package manager, build step, or server to patch.

The interactive 3D ram preview is the only heavier feature. Three.js is stored locally in `vendor/three/` and is loaded only after a visitor presses **Open 3D ram preview**, so it does not slow down normal page loads.

## GitHub Pages

The site works directly from the repository root.

Pages source:

- Branch: `main`
- Folder: `/ (root)`

For testing a feature branch, use a local static server such as:

```bash
python -m http.server 8000
```

## Custom domain later

When the final `.nz` or `.co.nz` domain is chosen:

1. Add a `CNAME` file containing the domain.
2. Point the domain DNS at GitHub Pages (or move the exact same static files to Cloudflare Pages).
3. Update the canonical URLs in `index.html`, `robots.txt`, and `sitemap.xml`.

## Replacing the 3D ram

The current 3D ram is a lightweight procedural stand-in. When a real scan is available, the viewer can be switched to a compressed `.glb` model without changing the page layout. Keep the model lazy-loaded so the main site stays fast on slow connections.
