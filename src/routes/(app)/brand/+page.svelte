<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Brand mark playground: compare every logo direction from the design
     handoff on the real site, in light & dark, with default or live data. -->

<script lang="ts">
  import Brand from "$lib/components/Brand.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import { marks } from "$lib/components/brand/marks";

  // Shared data the data-driven marks render from. Six values so the donut
  // (6 categories) is fully fed; the others take the slice they need.
  let data = $state([8, 5, 6, 3, 4, 2]);

  const previewSizes = [48, 36, 24, 16];

  // Which slice of `data` each data-driven mark consumes.
  const dataSlice: Record<string, number> = {
    "filled-tortilla": 6,
    sunburst: 3,
    "stacked-fillings": 4,
    "editorial-bars": 4,
  };

  function markData(id: string, driven: boolean): number[] | undefined {
    if (!driven) return undefined;
    return data.slice(0, dataSlice[id] ?? data.length);
  }

  function randomize() {
    data = data.map(() => 1 + Math.round(Math.random() * 9));
  }
</script>

<div class="page">
  <header class="head">
    <div>
      <div class="eyebrow">Brand · Logo &amp; wordmark</div>
      <h1>Icon directions</h1>
      <p class="lede">
        The seven marks explored in the design handoff, rendered as live components. The data-driven
        ones (donut, sunburst, stacked, bars) read from the values below so you can see how they
        hold up with real data.
      </p>
    </div>
    <ThemeToggle />
  </header>

  <section class="controls">
    <span class="ctl-label">Live data</span>
    <div class="inputs">
      {#each data as _, i (i)}
        <input type="number" min="0" bind:value={data[i]} aria-label={`Data value ${i + 1}`} />
      {/each}
    </div>
    <button type="button" class="randomize" onclick={randomize}>Randomize</button>
  </section>

  <div class="grid">
    {#each marks as m (m.id)}
      {@const Mark = m.component}
      <article class="card">
        <div class="card-head">
          <span class="num">{m.num}</span>
          <div>
            <h2>{m.name}</h2>
            <p class="tag">{m.tagline}</p>
          </div>
          {#if m.dataDriven}<span class="badge">live data</span>{/if}
        </div>

        <div class="lockups">
          <div class="tile tile-light force-light">
            <Brand mark={m.component} data={markData(m.id, m.dataDriven)} size={36} />
          </div>
          <div class="tile tile-dark force-dark">
            <Brand mark={m.component} data={markData(m.id, m.dataDriven)} size={36} />
          </div>
        </div>

        <div class="sizes">
          {#each previewSizes as s (s)}
            <div class="size-cell">
              <Mark size={s} data={markData(m.id, m.dataDriven)} title={m.name} />
            </div>
          {/each}
          <span class="size-caption">48 · 36 · 24 · 16</span>
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6) var(--space-24);
  }
  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
    margin-bottom: var(--space-8);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-widest);
    text-transform: uppercase;
    color: var(--fg-tertiary);
    margin-bottom: var(--space-2);
  }
  h1 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--fg-primary);
    line-height: var(--leading-tight);
    margin: 0 0 var(--space-2);
  }
  .lede {
    max-width: 60ch;
    color: var(--fg-secondary);
    font-size: var(--body-sm-size);
    line-height: var(--leading-normal);
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-8);
  }
  .ctl-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--fg-tertiary);
  }
  .inputs {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .inputs input {
    width: 52px;
    padding: 4px 6px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--fg-primary);
    background: var(--bg-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
  }
  .randomize {
    margin-left: auto;
    padding: 6px 14px;
    font-size: var(--text-sm);
    color: var(--fg-on-accent);
    background: var(--accent-primary);
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
  .randomize:hover {
    background: var(--accent-primary-hover);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-4);
  }
  .card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
  }
  .card-head {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }
  .num {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-tertiary);
    letter-spacing: var(--tracking-wide);
  }
  h2 {
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--fg-primary);
    margin: 0 0 2px;
    line-height: var(--leading-snug);
  }
  .tag {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    margin: 0;
    line-height: var(--leading-snug);
  }
  .badge {
    margin-left: auto;
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-secondary);
    background: var(--accent-secondary-subtle);
    padding: 3px 7px;
    border-radius: var(--radius-pill);
  }

  .lockups {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    min-height: 64px;
    overflow: hidden;
  }
  .tile-light {
    background: var(--color-warm-100);
    border: 1px solid var(--border-subtle);
  }
  .tile-dark {
    background: var(--color-warm-900);
  }

  .sizes {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
  }
  .size-cell {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .size-caption {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    color: var(--fg-tertiary);
  }

  /* Pin each tile to a fixed brand context so both the light and dark lockup
     stay legible regardless of the page theme. .force-light keeps dark-mode
     text from washing out on the cream tile; .force-dark mirrors body.dark-mode. */
  .force-light {
    --bg-base: var(--color-warm-100);
    --bg-surface: #ffffff;
    --fg-primary: var(--color-warm-900);
    --accent-primary: var(--color-terra-500);
    --data-cat-1: var(--color-terra-500);
    --data-cat-2: var(--color-slate-500);
    --data-cat-3: var(--color-amber-400);
    --data-cat-4: var(--color-sage-400);
    --data-cat-5: #8c5f9e;
    --data-cat-6: #3a8fa8;
  }
  .force-dark {
    --bg-base: #1a1714;
    --bg-surface: #231f1b;
    --fg-primary: #f2ebe0;
    --accent-primary: var(--color-terra-400);
    --data-cat-1: var(--color-terra-400);
    --data-cat-2: var(--color-slate-300);
    --data-cat-3: var(--color-amber-300);
    --data-cat-4: var(--color-sage-300);
    --data-cat-5: #b190c0;
    --data-cat-6: #7ab7cb;
  }

  @media (max-width: 640px) {
    .head {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
