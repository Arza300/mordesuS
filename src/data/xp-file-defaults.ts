import type { XpIconId } from "../types/xp-file";

export type XpFileDefault = {
  slug: string;
  name: string;
  lang: string;
  content: string;
  icon: XpIconId;
  sortOrder: number;
};

/** Default Windows XP easter-egg files (shared by seed + server fallback). */
export const DEFAULT_XP_FILES: XpFileDefault[] = [
  {
    slug: "index-html",
    name: "index.html",
    lang: "HTML",
    icon: "html",
    sortOrder: 0,
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Mordesu Studio — Files</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="desktop">
      <!-- Windows XP folder window lives here -->
    </div>
    <script src="./script.js"></script>
  </body>
</html>`,
  },
  {
    slug: "styles-css",
    name: "styles.css",
    lang: "CSS",
    icon: "css",
    sortOrder: 1,
    content: `:root {
  --xp-face: #ece9d8;
  --xp-border: #0a246a;
}

#desktop {
  min-height: 100vh;
  background: url("bliss.jpg") center / cover;
}

.xp-window {
  background: var(--xp-face);
  border: 1px solid var(--xp-border);
}`,
  },
  {
    slug: "script-js",
    name: "script.js",
    lang: "JavaScript",
    icon: "js",
    sortOrder: 2,
    content: `// Keep the hero charge in the mid band (~2s) by
// releasing and pressing again. Welcome to Mordesu XP.`,
  },
];
