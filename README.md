# Mathilde Outdoors

A single-page portfolio site for a bouldering and hiking guide. Built with vanilla HTML, SCSS, and JavaScript — no frameworks or bundlers.

## Tech stack

- **HTML** — single-page structure
- **SCSS** — compiled to CSS via Dart Sass (variables, mixins, nesting)
- **JavaScript** — vanilla ES6, no libraries
- **Fonts** — Google Fonts (Playfair Display + DM Sans)

## Getting started

Install Dart Sass globally if you haven't already:

```bash
npm install -g sass
```

Start the SCSS compiler from the project root:

```bash
sass --watch styles.scss:styles.css
```

Serve the site with a local HTTP server (opening `index.html` directly won't work due to browser security restrictions):

```bash
npx serve .
```

The images are compressed before being committed to git using the compress-images.sh script. This is not necesary to run before deploying but if you want to use it
```bash
chmod +x compress-images.sh
./compress-images.sh
```

## Deploying

The site is fully static. For production, you only need to deploy `index.html`, `styles.css`, `main.js`, and the `assets/` folder.