<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import { db } from "$lib/chartStore";
  import { deltaToPlainText, type Root } from "$lib/chart";
  import { notifications } from "$lib/notificationStore";
  import Brand from "$lib/components/Brand.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import Pill from "$lib/components/Pill.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import FileCard from "$lib/components/chart-list/FileCard.svelte";
  import type { File as ChartFile } from "$lib/components/chart-list/types";
  import type { PageProps } from "./$types";
  import { browser } from "$app/environment";

  let { data }: PageProps = $props();
  let returnURL = $derived(data.returnURL?.startsWith("/") ? data.returnURL : null);

  let showPassword = $state(false);
  let remember = $state(true);

  let localDocs: ReturnType<typeof db.getLocal> = $state([]);

  // Example charts; their data is fetched from data.sampleCharts in onMount.
  let examples: { id: string; chart: Root }[] = $state([]);

  // Local drafts + examples as chart-list cards. Built client-side only:
  // FileCard previews rely on browser-only APIs (iframe + postMessage).
  let charts = $derived(
    browser
      ? [
          ...localDocs.map((c) => ({
            chart: c.data,
            link: resolve("/(app)/editor/chart/[id]", { id: c.id }),
            item: {
              type: "file",
              id: c.id,
              name: deltaToPlainText(c?.data?.chart?.title) || "Unnamed chart",
              created: c?.created ?? 0,
              updated: c?.updated ?? 0,
              chartRef: c.id,
              tags: [
                { category: "kind", color: "var(--color-amber-200)", id: "kind", key: "local" },
              ],
            } satisfies ChartFile,
          })),
          ...examples.map((ex) => ({
            chart: ex.chart,
            link: resolve("/(app)/example/[id]", { id: ex.id }),
            item: {
              type: "file",
              id: "example-" + ex.id,
              name: deltaToPlainText(ex.chart?.chart?.title) || "Unnamed chart",
              created: 0,
              updated: 0,
              chartRef: "example-" + ex.id,
              tags: [
                { category: "kind", color: "var(--color-slate-200)", id: "kind", key: "example" },
              ],
            } satisfies ChartFile,
          })),
        ]
      : [],
  );

  const newGraphic = async () => {
    const docId = await db.create(false);
    goto(resolve("/(app)/editor/chart/[id]", { id: docId }));
  };

  onMount(() => {
    localDocs = db.getLocal();

    data.sampleCharts.forEach((s, i) => {
      fetch(s.url)
        .then((r) => r.json())
        .then((c) => (examples[i] = { id: s.id, chart: c }));
    });

    if (data.session?.user) {
      goto(resolve("/(app)/(main)/me", {}));
    }

    if (data.msg) {
      notifications.addError(
        data.msg == "password_error" ? "Check if username and password is correct" : "",
      );
    }
  });
</script>

<div class="page">
  <!-- LEFT: topbar + editorial intro -->
  <div class="left">
    <header class="topbar">
      <Brand href="/" />
      <div class="top-right">
        <ThemeToggle />
      </div>
    </header>

    <section class="intro">
      <div class="lede">
        <h1>Build your story, <em>your way.</em></h1>
        <p>
          A flexible editor for <strong>charts and visual stories</strong> — design and publish data
          visualizations in simple collaborative web editor.
        </p>
      </div>

      <!-- Try-it card: local drafts (saved in this browser) + example charts -->
      <div class="try-it">
        <div class="try-head">
          <div>
            <div class="try-title">Just looking around?</div>
            <div class="try-sub">
              Open the editor without an account — nothing is saved to our servers.
            </div>
          </div>
          <button class="try-cta" type="button" onclick={newGraphic}>
            New chart
            <Icon name="arrowUpRight" size={14} />
          </button>
        </div>

        <div class="try-meta">
          <span class="dot"></span>
          Saved in this browser
          <span class="try-count">{charts.length} drafts</span>
        </div>

        <div class="chart-grid">
          {#each charts as { item, chart, link } (item.id)}
            <FileCard {item} {chart} {link} />
          {:else}
            <div class="chart-empty">No local drafts yet — start one with “New chart”.</div>
          {/each}
        </div>

        <div class="try-footer">
          <span class="info-ic">
            <Icon name="info" size={14} />
          </span>
          Local drafts live in your browser only. Sign in to save them to your workspace.
        </div>
      </div>
    </section>
  </div>
  <!-- /.left -->

  <!-- RIGHT: sign in -->
  <section class="auth">
    <div class="auth-head">
      <h2>Sign in</h2>
      <p>
        New here? <a href={resolve("/(app)/signup", {})}>Create an account</a> — takes about 30 seconds.
      </p>
    </div>

    <form class="form" method="POST" action="/signin?/password">
      {#if returnURL}
        <input type="hidden" name="return_url" value={returnURL} />
      {/if}

      <div class="field-group">
        <div class="field-label-row">
          <label class="field-label" for="email">Email</label>
        </div>
        <div class="input-wrap">
          <span class="input-ic">
            <Icon name="mail" size={14} />
          </span>
          <input
            class="input"
            id="email"
            name="username"
            type="email"
            placeholder="you@newsroom.org"
            autocomplete="email"
          />
        </div>
      </div>

      <div class="field-group">
        <div class="field-label-row">
          <label class="field-label" for="password">Password</label>
          <a href={resolve("/(app)/reset-password", {})}>Forgot it?</a>
        </div>
        <div class="input-wrap">
          <span class="input-ic">
            <Icon name="lock" size={14} />
          </span>
          <input
            class="input"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="reveal"
            onclick={() => (showPassword = !showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Icon name="eye" size={14} />
          </button>
        </div>
      </div>

      <button
        type="button"
        class="check-row"
        onclick={() => (remember = !remember)}
        aria-pressed={remember}
      >
        <span class="check" class:checked={remember}>
          <span class="check-tick">
            <Icon name="check" size={11} stroke={2.4} />
          </span>
        </span>
        Keep me signed in on this browser
      </button>
      <input type="hidden" name="remember" value={remember ? "1" : ""} />

      <button class="btn-primary" type="submit">
        Sign in
        <Icon name="arrowRight" size={16} />
      </button>
    </form>

    <div class="divider"><span class="lbl">Or sign in with</span></div>

    <!-- SSO placeholder area (feature not built yet) -->
    <div class="sso" aria-disabled="true">
      <div class="sso-head">
        <Icon name="messageCircle" size={14} />
        Single sign-on
        <span class="sso-soon">
          <Pill mono uppercase square tone="warning">Coming soon</Pill>
        </span>
      </div>
      <div class="sso-grid">
        <button class="sso-btn" type="button" aria-disabled="true" tabindex="-1">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21.35 11.1h-9.17v2.9h5.27c-.23 1.4-1.66 4.1-5.27 4.1-3.17 0-5.76-2.63-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.02.77 3.71 1.43l2.53-2.43C16.74 3.74 14.65 2.9 12.18 2.9 6.92 2.9 2.7 7.1 2.7 12.24s4.22 9.34 9.48 9.34c5.47 0 9.09-3.85 9.09-9.27 0-.62-.07-1.1-.17-1.21z"
            />
          </svg>
          Google
        </button>
        <button class="sso-btn" type="button" aria-disabled="true" tabindex="-1">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.75.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .3.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
            />
          </svg>
          GitHub
        </button>
        <button class="sso-btn" type="button" aria-disabled="true" tabindex="-1">
          <Icon name="externalLink" size={14} />
          SAML / SSO
        </button>
      </div>
      <div class="sso-note">Single sign-on is on the way — password sign-in works today.</div>
    </div>

    <div class="footer-micro">
      <span>About</span>
      <span>Docs</span>
      <span>Privacy</span>
      <span>Terms</span>
      <span class="footer-version">v1.0 · 2026</span>
    </div>
  </section>
</div>

<style>
  .page {
    display: grid;
    grid-template-columns: minmax(420px, 1fr) minmax(440px, 520px);
    min-height: 100vh;
    background: radial-gradient(
        1200px 600px at 88% 110%,
        color-mix(in oklab, var(--accent-primary) 7%, transparent),
        transparent 60%
      ),
      radial-gradient(
        900px 500px at 5% -10%,
        color-mix(in oklab, var(--color-amber-300) 6%, transparent),
        transparent 55%
      ),
      var(--bg-base);
  }

  .left {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-right: 1px solid var(--border-subtle);
  }

  /* ===== Topbar ===== */
  .topbar {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 56px;
    padding: 0 28px;
    position: relative;
    z-index: 5;
  }
  .top-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Brand glyphs (Google/GitHub) remain inline SVGs and use this class. */
  .icon {
    width: 14px;
    height: 14px;
    display: inline-block;
    flex-shrink: 0;
  }

  /* ===== Left — editorial intro ===== */
  .intro {
    flex: 1;
    padding: 40px 64px 48px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    min-width: 0;
  }
  .lede h1 {
    font-family: var(--font-display);
    font-size: 56px;
    line-height: 1.02;
    letter-spacing: -0.02em;
    color: var(--fg-primary);
    margin: 0 0 18px;
    font-weight: 400;
    max-width: 12ch;
  }
  .lede h1 em {
    font-style: italic;
    color: var(--accent-primary);
  }
  .lede p {
    font-size: 16px;
    line-height: 1.55;
    color: var(--fg-secondary);
    max-width: 48ch;
  }
  .lede p strong {
    color: var(--fg-primary);
    font-weight: 500;
  }

  /* Try-it card */
  .try-it {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    background: color-mix(in oklab, var(--bg-surface) 65%, transparent);
    backdrop-filter: blur(6px);
    overflow: hidden;
    container-type: inline-size;
  }
  :global(body.dark-mode) .try-it {
    background: color-mix(in oklab, var(--bg-surface) 50%, transparent);
  }
  .try-head {
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .try-title {
    font-family: var(--font-display);
    font-size: 20px;
    line-height: 1;
    color: var(--fg-primary);
  }
  .try-sub {
    font-size: 12.5px;
    color: var(--fg-tertiary);
    line-height: 1.4;
    margin-top: 4px;
  }
  .try-cta {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: auto;
    padding: 7px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--fg-primary);
    cursor: pointer;
    white-space: nowrap;
    transition:
      background var(--duration-micro) var(--ease-standard),
      border-color var(--duration-micro) var(--ease-standard);
  }
  .try-cta:hover {
    background: var(--color-warm-100);
    border-color: var(--border-strong);
  }
  :global(body.dark-mode) .try-cta:hover {
    background: var(--bg-sunken);
  }

  .try-meta {
    padding: 10px 20px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .try-meta .dot {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--color-amber-400);
  }
  .try-meta .try-count {
    margin-left: auto;
    opacity: 0.6;
  }

  /* Up to two chart previews side by side; collapses to one when narrow. */
  .chart-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 14px 20px;
  }
  .chart-grid:has(.chart-empty) {
    grid-template-columns: 1fr;
  }
  @container (max-width: 460px) {
    .chart-grid {
      grid-template-columns: 1fr;
    }
  }
  .chart-empty {
    font-size: 13px;
    color: var(--fg-tertiary);
  }

  .try-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-subtle);
    background: color-mix(in oklab, var(--bg-sunken) 35%, transparent);
    font-size: 12px;
    color: var(--fg-tertiary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .try-footer .info-ic {
    display: inline-flex;
    color: var(--color-warm-500);
    flex-shrink: 0;
  }

  /* ===== Right — sign in ===== */
  .auth {
    padding: 56px 64px 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 24px;
    min-width: 0;
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--bg-surface) 65%, transparent),
      transparent 80%
    );
  }
  :global(body.dark-mode) .auth {
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--bg-elevated) 55%, transparent),
      transparent 80%
    );
  }
  .auth-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .auth-head h2 {
    font-family: var(--font-display);
    font-size: 34px;
    line-height: 1.05;
    letter-spacing: -0.015em;
    color: var(--fg-primary);
    font-weight: 400;
  }
  .auth-head p {
    font-size: 13.5px;
    color: var(--fg-secondary);
  }
  .auth-head p a {
    color: var(--color-link);
    text-decoration: none;
    border-bottom: 1px solid color-mix(in oklab, var(--color-link) 35%, transparent);
  }
  .auth-head p a:hover {
    color: var(--color-link-hover);
    border-color: var(--color-link-hover);
  }

  /* Form */
  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .field-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--fg-secondary);
    letter-spacing: 0.01em;
  }
  .field-label-row a {
    font-size: 12px;
    color: var(--color-link);
    text-decoration: none;
  }
  .field-label-row a:hover {
    color: var(--color-link-hover);
    text-decoration: underline;
  }

  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-wrap .input-ic {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    color: var(--fg-tertiary);
    pointer-events: none;
  }
  .input {
    width: 100%;
    height: 40px;
    padding: 0 14px 0 38px;
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--fg-primary);
    transition:
      border-color var(--duration-micro) var(--ease-standard),
      box-shadow var(--duration-micro) var(--ease-standard);
  }
  .input::placeholder {
    color: var(--fg-tertiary);
  }
  .input:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--border-focus) 22%, transparent);
  }
  .reveal {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    height: auto;
    color: var(--fg-tertiary);
    background: none;
    border: 0;
    padding: 4px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .reveal:hover {
    color: var(--fg-primary);
    background: var(--color-warm-100);
  }
  :global(body.dark-mode) .reveal:hover {
    background: var(--bg-sunken);
  }

  .check-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    height: auto;
    padding: 0;
    margin-top: 2px;
    background: none;
    border: 0;
    font-size: 13px;
    font-weight: 400;
    color: var(--fg-secondary);
    cursor: pointer;
  }
  .check-row:hover {
    background: none;
    color: var(--fg-secondary);
  }
  .check {
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-default);
    border-radius: 3px;
    background: var(--bg-surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      border-color var(--duration-micro),
      background var(--duration-micro);
  }
  .check-tick {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    color: var(--fg-inverse);
    transition: opacity var(--duration-micro);
  }
  .check.checked {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
  }
  .check.checked .check-tick {
    opacity: 1;
  }

  .btn-primary {
    height: 42px;
    border-radius: var(--radius-md);
    background: var(--accent-primary);
    color: var(--fg-inverse);
    border: 1px solid var(--accent-primary);
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition:
      background var(--duration-micro) var(--ease-standard),
      border-color var(--duration-micro) var(--ease-standard),
      transform var(--duration-micro) var(--ease-standard);
    margin-top: 4px;
  }
  .btn-primary:hover {
    background: var(--accent-primary-hover);
    border-color: var(--accent-primary-hover);
  }
  .btn-primary:active {
    transform: scale(0.985);
    background: var(--accent-primary-press);
  }

  /* Divider */
  .divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    margin: 6px 0 2px;
  }
  .divider::before,
  .divider::after {
    content: "";
    height: 1px;
    background: var(--border-subtle);
  }
  .divider .lbl {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
  }

  /* SSO area — placeholder/disabled */
  .sso {
    border: 1px dashed var(--border-default);
    border-radius: var(--radius-lg);
    padding: 14px 16px;
    background: color-mix(in oklab, var(--bg-sunken) 30%, transparent);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sso-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--fg-secondary);
  }
  .sso-soon {
    margin-left: auto;
    display: inline-flex;
  }
  .sso-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .sso-btn {
    height: 38px;
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    color: var(--fg-tertiary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 500;
    opacity: 0.7;
    cursor: not-allowed;
  }
  .sso-btn:hover {
    background: var(--bg-surface);
  }
  .sso-btn svg {
    opacity: 0.6;
  }
  .sso-note {
    font-size: 11.5px;
    color: var(--fg-tertiary);
    line-height: 1.4;
  }

  /* Footer micro */
  .footer-micro {
    margin-top: auto;
    padding-top: 24px;
    display: flex;
    gap: 16px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.08em;
    color: var(--fg-tertiary);
    text-transform: uppercase;
  }
  .footer-micro .footer-version {
    margin-left: auto;
    opacity: 0.7;
  }

  /* Responsive collapse */
  @media (max-width: 900px) {
    .page {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .left {
      border-right: 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    .intro {
      padding: 24px 32px 32px;
    }
    .auth {
      padding: 32px;
    }
    .lede h1 {
      font-size: 40px;
    }
  }
</style>
