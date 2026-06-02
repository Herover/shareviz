<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Shared page header: an optional overline (with accent dot), a display
     title and an optional breadcrumb trail, with a bottom rule. Used by the
     settings pages and the team chart list to keep page chrome consistent. -->

<script lang="ts">
  interface Crumb {
    label: string;
    href?: string;
  }

  interface Props {
    overline?: string;
    title: string;
    crumbs?: Crumb[];
  }
  let { overline, title, crumbs }: Props = $props();
</script>

<div class="page-head">
  {#if overline}
    <div class="page-overline"><span class="dot"></span>{overline}</div>
  {/if}
  <h1 class="page-title">{title}</h1>
  {#if crumbs && crumbs.length}
    <div class="crumbs">
      {#each crumbs as crumb, i (i)}
        {#if i > 0}<span class="sep">/</span>{/if}
        {#if crumb.href && i < crumbs.length - 1}
          <!-- href is supplied already-resolved by the caller. -->
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href={crumb.href}>{crumb.label}</a>
        {:else}
          <span class:current={i === crumbs.length - 1}>{crumb.label}</span>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .page-head {
    margin-bottom: 28px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--fg-primary);
  }
  .page-overline {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .page-overline .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-primary);
  }
  .page-title {
    font-family: var(--font-display);
    font-size: 2.2rem;
    font-weight: 400;
    letter-spacing: -0.015em;
    line-height: 1.1;
    color: var(--fg-primary);
    margin: 0 0 6px;
    text-transform: none;
  }
  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--fg-secondary);
  }
  .crumbs a {
    color: var(--fg-secondary);
    text-decoration: none;
  }
  .crumbs a:hover {
    color: var(--fg-primary);
    text-decoration: underline;
  }
  .crumbs .sep {
    color: var(--fg-tertiary);
  }
  .crumbs .current {
    color: var(--fg-primary);
    font-weight: 600;
  }
</style>
