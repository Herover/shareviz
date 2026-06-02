<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- A settings section card: overline + title + description header, with an
     optional header aside and a body. Set `flush` to remove body padding
     (e.g. for full-bleed lists or tables). -->

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    id?: string;
    overline?: string;
    title: string;
    description?: string;
    flush?: boolean;
    aside?: Snippet;
    children: Snippet;
  }
  let { id, overline, title, description, flush = false, aside, children }: Props = $props();
</script>

<section class="card" {id}>
  <div class="card-head">
    <div class="card-head-text">
      {#if overline}<p class="overline">{overline}</p>{/if}
      <h2 class="card-title">{title}</h2>
      {#if description}<p class="card-desc">{description}</p>{/if}
    </div>
    {#if aside}<div class="card-head-aside">{@render aside()}</div>{/if}
  </div>
  <div class="card-body" class:flush>
    {@render children()}
  </div>
</section>

<style>
  .card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-1);
    overflow: hidden;
    scroll-margin-top: 72px;
  }
  .card-head {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .card-head-text {
    min-width: 0;
    flex: 1;
  }
  .overline {
    font-family: var(--font-body);
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    margin: 0 0 6px;
  }
  .card-title {
    font-family: var(--font-display);
    font-size: 1.45rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.15;
    color: var(--fg-primary);
    margin: 0 0 4px;
    text-transform: none;
  }
  .card-desc {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--fg-secondary);
    margin: 0;
    max-width: 60ch;
  }
  .card-head-aside {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-body {
    padding: 20px 24px 22px;
  }
  .card-body.flush {
    padding: 0;
  }
</style>
