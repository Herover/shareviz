<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Reusable light/dark theme toggle. Reflects the effective theme and flips it on click. -->

<script lang="ts">
  import { settings } from "$lib/settingsStore.svelte";

  let isDark = $derived(settings.theme == "dark");

  const toggle = () => {
    settings.theme = isDark ? "light" : "dark";
  };
</script>

<button class="theme-toggle" type="button" onclick={toggle} aria-label="Switch theme">
  <span class="thumb">
    {#if isDark}
      <!-- moon -->
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    {:else}
      <!-- sun -->
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
      </svg>
    {/if}
  </span>
  <span class="lbl">{isDark ? "DARK" : "LIGHT"}</span>
</button>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: auto;
    padding: 6px 10px 6px 6px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    color: var(--fg-secondary);
    font-size: 12px;
    cursor: pointer;
    transition:
      border-color var(--duration-micro) var(--ease-standard),
      background var(--duration-micro) var(--ease-standard);
  }
  .theme-toggle:hover {
    border-color: var(--border-strong);
    background: var(--bg-surface);
    color: var(--fg-primary);
  }
  .thumb {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--color-amber-200);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-amber-700);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-amber-500) 30%, transparent);
  }
  :global(body.dark-mode) .thumb {
    background: var(--color-slate-700);
    color: var(--color-slate-100);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-slate-300) 35%, transparent);
  }
  .lbl {
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .icon {
    width: 14px;
    height: 14px;
    display: inline-block;
    flex-shrink: 0;
  }
</style>
