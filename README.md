# cristopher-264.github.io

Personal engineering portfolio for Cristopher Miranda. Plain HTML, CSS, and a little
vanilla JavaScript — no build step — hosted on GitHub Pages.

## Structure

```
index.html          Home page: hero, experience, project grid, personal, contact
projects/*.html     One page per project
style.css           All styles (design tokens are at the top under :root)
script.js           Mobile nav, active-section nav highlight, footer year
pdf-viewer.js       Slide-deck viewer built on PDF.js (loaded from cdnjs)
404.html            Custom not-found page (GitHub Pages serves this automatically)
images/             Photos, thumbnails, logos
files/              Resume and slide decks (PDF)
```

## Local preview

Any static file server works. For example:

```bash
python3 -m http.server 8000
```

then open <http://localhost:8000>.

## Adding a project

1. Copy an existing page in `projects/` (for example `thermal-vacuum-chamber.html`)
   and rename it to a URL-friendly slug like `my-new-project.html`.
2. Update the `<title>`, `<meta name="description">`, the `og:` meta tags, the year
   badge, tags, `<h1>`, and lede.
3. Add images to `images/` and reference them with `../images/…`. Keep photos around
   1600 px on the long edge and under ~500 KB; thumbnails at ~1200 px.
4. Optional: to embed a slide deck, add the PDF to `files/` and include:

   ```html
   <div class="pdf-viewer" data-pdf="../files/my-new-project-deck.pdf">
     <p class="pdf-loading">Loading slides…</p>
   </div>
   <p class="pdf-fallback">
     <a href="../files/my-new-project-deck.pdf" target="_blank" rel="noopener">Open the full PDF in a new tab</a>
   </p>
   ```

   and keep the two `<script>` tags for PDF.js and `pdf-viewer.js` at the bottom of the page.
5. Add a card to the project grid in `index.html`. The card title is the link; the
   thumbnail `<img>` should have `alt=""` and `loading="lazy"`.

## Image tips

Large photos slow the site down noticeably. On macOS, `sips` is built in:

```bash
sips -Z 1600 -s formatOptions 85 images/photo.jpg      # resize to 1600 px max, JPEG quality 85
sips -s format jpeg -s formatOptions 85 in.png --out out.jpg   # convert a photo PNG to JPEG
```

Ghostscript can shrink heavy slide decks without visible loss:

```bash
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dPDFSETTINGS=/printer -sOutputFile=out.pdf in.pdf
```
