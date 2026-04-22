<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { run } from "svelte/legacy";

  import "$lib/common.css";
  import { page } from "$app/stores";
  import { user } from "$lib/userStore";
  import { settings } from "$lib/settingsStore.svelte";
  import NotificationArea from "$lib/components/NotificationArea.svelte";
  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  run(() => {
    if ($page.data.session?.user?.id != null) {
      user.update();
    }
  });

  $effect(() => {
    if (settings.theme == "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  });

  // TODO: UI
  (window as any).setTheme = (theme: typeof settings.theme) => (settings.theme = theme);
</script>

<NotificationArea />

{@render children?.()}

<style>
  :global {
    [role="button"] {
      cursor: pointer;
    }

    :root {
      /* ============================================================
      BASE COLOR PALETTE
      ============================================================ */
      /* Brand Warm Neutrals (Tortilla Scale) */
      --color-warm-50: #fdfaf6;
      --color-warm-100: #f7f3ee;
      --color-warm-200: #ede4d8;
      --color-warm-300: #ddd0c0;
      --color-warm-400: #c4b09a;
      --color-warm-500: #a8907a;
      --color-warm-600: #8c7260;
      --color-warm-700: #6b5344;
      --color-warm-800: #4a3728;
      --color-warm-900: #2a1e14;

      /* Terracotta / Rust (Primary Accent) */
      --color-terra-50: #fdf2ee;
      --color-terra-100: #fae0d5;
      --color-terra-200: #f5bbaa;
      --color-terra-300: #ee9070;
      --color-terra-400: #e56b42;
      --color-terra-500: #c9502a; /* Primary interactive */
      --color-terra-600: #a83f20;
      --color-terra-700: #872f14;
      --color-terra-800: #5e1e0a;
      --color-terra-900: #3a1004;

      /* Slate Blue (Secondary / Data Accent) */
      --color-slate-50: #eef2f7;
      --color-slate-100: #d5e0ee;
      --color-slate-200: #aabddb;
      --color-slate-300: #7e99c4;
      --color-slate-400: #5578aa;
      --color-slate-500: #3a5e8e; /* Secondary interactive */
      --color-slate-600: #2c4a72;
      --color-slate-700: #1e3655;
      --color-slate-800: #122238;
      --color-slate-900: #091220;

      /* Amber (Highlight / Warning) */
      --color-amber-50: #fffbf0;
      --color-amber-100: #fff2cc;
      --color-amber-200: #ffe28a;
      --color-amber-300: #ffcf45;
      --color-amber-400: #f5b800;
      --color-amber-500: #c99200;
      --color-amber-600: #9a6f00;
      --color-amber-700: #6b4c00;

      /* Sage Green (Success) */
      --color-sage-50: #eff5f0;
      --color-sage-100: #d0e6d2;
      --color-sage-200: #a1cda6;
      --color-sage-300: #70b077;
      --color-sage-400: #4a9352;
      --color-sage-500: #35773c;
      --color-sage-600: #245a2a;

      /* ============================================================
      SEMANTIC COLOR TOKENS
      ============================================================ */
      /* Backgrounds */
      --bg-base: var(--color-warm-100); /* #F7F3EE — page background */
      --bg-surface: #ffffff; /* card / panel surface */
      --bg-sunken: var(--color-warm-200); /* inset / trough */
      --bg-overlay: rgba(247, 243, 238, 0.88); /* frosted overlay */

      /* Foregrounds */
      --fg-primary: var(--color-warm-900); /* #2A1E14 — primary text */
      --fg-secondary: var(--color-warm-700); /* secondary / muted text */
      --fg-tertiary: var(--color-warm-500); /* placeholder / disabled */
      --fg-inverse: var(--color-warm-50); /* text on dark bg */

      /* Brand Interactive */
      --accent-primary: var(--color-terra-500);
      --accent-primary-hover: var(--color-terra-600);
      --accent-primary-press: var(--color-terra-700);
      --accent-primary-subtle: var(--color-terra-100);

      --accent-secondary: var(--color-slate-500);
      --accent-secondary-hover: var(--color-slate-600);
      --accent-secondary-subtle: var(--color-slate-100);

      /* Links */
      --color-link: var(--color-slate-500); /* #3A5E8E — default link */
      --color-link-hover: var(--color-slate-700); /* #1E3655 — hover */
      --color-link-visited: var(--color-slate-600); /* #2C4A72 — visited */
      --color-link-active: var(--color-terra-500); /* #C9502A — active/pressed */

      /* Borders */
      --border-subtle: var(--color-warm-200); /* card borders, dividers */
      --border-default: var(--color-warm-300);
      --border-strong: var(--color-warm-500);
      --border-focus: var(--color-terra-400); /* focus ring */

      /* State */
      --state-error: var(--color-terra-500);
      --state-warning: var(--color-amber-500);
      --state-success: var(--color-sage-500);
      --state-info: var(--color-slate-500);

      --state-error-bg: var(--color-terra-100);
      --state-warning-bg: var(--color-amber-100);
      --state-success-bg: var(--color-sage-100);
      --state-info-bg: var(--color-slate-100);

      /* Shadows */
      --shadow-1: 0 1px 3px rgba(42, 30, 20, 0.07), 0 1px 2px rgba(42, 30, 20, 0.04);
      --shadow-2: 0 4px 16px rgba(42, 30, 20, 0.12), 0 2px 4px rgba(42, 30, 20, 0.06);
      --shadow-3: 0 20px 60px rgba(42, 30, 20, 0.18);

      /* ============================================================
      TYPOGRAPHY TOKENS
      ============================================================ */
      /* Font Families */
      --font-display: "DM Serif Display", Georgia, "Times New Roman", serif;
      --font-body: "Atkinson Hyperlegible Next", "DM Sans", system-ui, -apple-system, sans-serif;
      --font-mono: "IBM Plex Mono", "Fira Code", "Courier New", monospace;

      /* Type Scale (Major Third × 1.25, base 16px) */
      --text-xs: 0.64rem; /*  ~10.2px */
      --text-sm: 0.8rem; /*  ~12.8px */
      --text-base: 1rem; /*  16px    */
      --text-md: 1.25rem; /*  20px    */
      --text-lg: 1.5625rem; /*  25px    */
      --text-xl: 1.953rem; /*  ~31px   */
      --text-2xl: 2.441rem; /*  ~39px   */
      --text-3xl: 3.052rem; /*  ~49px   */
      --text-4xl: 3.815rem; /*  ~61px   */

      /* Line Heights */
      --leading-tight: 1.2;
      --leading-snug: 1.35;
      --leading-normal: 1.55;
      --leading-loose: 1.75;

      /* Letter Spacing */
      --tracking-tight: -0.025em;
      --tracking-normal: 0em;
      --tracking-wide: 0.05em;
      --tracking-widest: 0.12em;

      /* Font Weights */
      --weight-light: 300;
      --weight-regular: 400;
      --weight-medium: 500;
      --weight-semibold: 600;
      --weight-bold: 700;

      /* ============================================================
      SEMANTIC TYPOGRAPHY
      ============================================================ */
      /* Display / Hero */
      --h1-font: var(--font-display);
      --h1-size: var(--text-3xl);
      --h1-weight: var(--weight-regular); /* DM Serif looks best at regular */
      --h1-leading: var(--leading-tight);
      --h1-tracking: var(--tracking-tight);

      --h2-font: var(--font-display);
      --h2-size: var(--text-2xl);
      --h2-weight: var(--weight-regular);
      --h2-leading: var(--leading-tight);
      --h2-tracking: var(--tracking-tight);

      --h3-font: var(--font-body);
      --h3-size: var(--text-xl);
      --h3-weight: var(--weight-semibold);
      --h3-leading: var(--leading-snug);

      --h4-font: var(--font-body);
      --h4-size: var(--text-lg);
      --h4-weight: var(--weight-semibold);
      --h4-leading: var(--leading-snug);

      /* Body */
      --body-font: var(--font-body);
      --body-size: var(--text-base);
      --body-weight: var(--weight-regular);
      --body-leading: var(--leading-normal);

      --body-sm-size: var(--text-sm);

      /* Labels & UI */
      --label-font: var(--font-body);
      --label-size: var(--text-sm);
      --label-weight: var(--weight-medium);
      --label-leading: var(--leading-tight);
      --label-tracking: var(--tracking-wide);

      /* Overline / Tag */
      --overline-font: var(--font-body);
      --overline-size: var(--text-xs);
      --overline-weight: var(--weight-semibold);
      --overline-tracking: var(--tracking-widest);
      --overline-transform: uppercase;

      /* Data / Mono */
      --data-font: var(--font-mono);
      --data-size: var(--text-sm);
      --data-weight: var(--weight-regular);
      --data-leading: var(--leading-normal);

      /* ============================================================
      SPACING & RADIUS TOKENS
      ============================================================ */
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-6: 24px;
      --space-8: 32px;
      --space-12: 48px;
      --space-16: 64px;
      --space-24: 96px;
      --space-32: 128px;

      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --radius-xl: 12px;
      --radius-2xl: 16px;
      --radius-pill: 999px;
      --radius-none: 0px;

      /* Transitions */
      --ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
      --ease-out: cubic-bezier(0, 0, 0.2, 1);
      --ease-in: cubic-bezier(0.4, 0, 1, 1);
      --duration-micro: 120ms;
      --duration-standard: 200ms;
      --duration-layout: 350ms;

      --width-wide: 1200px;
      --spacing: 1.5em;
    }
    body.dark-mode {
      --bg-base: var(--color-warm-900);
      --bg-surface: #231a11;
      --bg-sunken: var(--color-warm-800);
      --bg-overlay: rgba(42, 30, 20, 0.88);
      --fg-primary: var(--color-warm-100);
      --fg-secondary: var(--color-warm-300);
      --fg-tertiary: var(--color-warm-500);
      --fg-inverse: var(--color-warm-900);
      --border-subtle: var(--color-warm-800);
      --border-default: var(--color-warm-700);
      --border-strong: var(--color-warm-500);
    }

    @font-face {
      font-family: "Atkinson Hyperlegible Next";
      src:
        url("/fonts/AtkinsonHyperlegibleNext/WOFF2/AtkinsonHyperlegibleNextVF-Variable.woff2")
          format("woff2"),
        url("/fonts/AtkinsonHyperlegibleNext/TTF/AtkinsonHyperlegibleNextVF-Variable.ttf")
          format("truetype");
    }

    body * {
      box-sizing: border-box;
    }
    body {
      background-color: var(--bg-base);
      color: var(--fg-primary);
      font-family: var(--font-body);
      font-size: var(--body-size);
      line-height: var(--leading-normal);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      text-wrap: pretty;
    }

    /* Semantic element defaults */
    h1 {
      font-family: var(--h1-font);
      font-size: var(--h1-size);
      font-weight: var(--h1-weight);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
    }
    h2 {
      font-family: var(--h2-font);
      font-size: var(--h2-size);
      font-weight: var(--h2-weight);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
    }
    h3 {
      font-family: var(--h3-font);
      font-size: var(--h3-size);
      font-weight: var(--h3-weight);
      line-height: var(--leading-snug);
    }
    h4 {
      font-family: var(--h4-font);
      font-size: var(--h4-size);
      font-weight: var(--h4-weight);
      line-height: var(--leading-snug);
    }
    p {
      font-size: var(--body-size);
      line-height: var(--leading-normal);
    }
    code,
    pre {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
    }
    a {
      color: var(--color-link);
      text-decoration: none;
    }
    a:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
    }
    a:visited {
      color: var(--color-link-visited);
    }
    a:active {
      color: var(--color-link-active);
    }

    button,
    input,
    text {
      font-family: var(--font-body);
    }
    a,
    a:link,
    a:visited {
      color: var(--color-link);
    }
    a:hover {
      color: var(--color-link-hover);
    }
    a:active {
      color: var(--color-link-active);
    }
    header h1 {
      font-size: var(--text-xl);
    }
  }
</style>
