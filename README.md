# cristopher-264.github.io

Personal engineering portfolio for Cristopher Miranda. Plain HTML and CSS, no build step, hosted on GitHub Pages.

```
index.html        Home: intro, project list, about, contact
projects/*.html   One page per project
style.css         All styles (colors and fonts are the variables at the top)
images/           Photos and thumbnails
files/            Resume and slide decks
```

## Preview locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add a project

1. Copy a page in `projects/`, rename it, and edit the title, lede, meta line, hero image, and text.
2. Add a `<li>` to the list in `index.html`.
3. Keep photos around 1600 px wide. On macOS: `sips -Z 1600 -s formatOptions 85 photo.jpg`.
