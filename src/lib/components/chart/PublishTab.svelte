<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import dayjs from "dayjs";
  import type { Root } from "$lib/chart";
  import CopyField from "./CopyField.svelte";
  import EditorCollapsible from "./EditorCollapsible.svelte";

  interface Publication {
    chartPublication: {
      id: string;
      chartId: string;
      v: number;
      created: number;
    };
  }

  /* eslint-disable svelte/no-navigation-without-resolve */

  interface Props {
    /** Most recent first. */
    publications: Publication[];
    /** Live working-copy version — what would be published next. */
    version: number | undefined;
    /** Origin of the embed viewer (e.g. https://view.example.com). */
    viewerOrigin: string;
    /** Full chart spec, stringified into the JSON export copy field. */
    chartSpec: Root;
    /** PNG export scale (1 / 2 / 4). Two-way bound. */
    imageScale: number;
    onPublish: () => void;
    onGeneratePng: () => void;
  }

  let {
    publications,
    version,
    viewerOrigin,
    chartSpec,
    imageScale = $bindable(),
    onPublish,
    onGeneratePng,
  }: Props = $props();

  const SCALES = [1, 2, 4] as const;
  const embedUrl = (id: string) => `${viewerOrigin}/view/chart/${id}`;
  const jsonExport = $derived(JSON.stringify(chartSpec));
</script>

<h3 class="editor-sub-section">Embed</h3>
<p class="editor-sub-section-description">
  Share a responsive, interactive chart. New publishes create a versioned snapshot — old links keep
  working.
</p>

{#if publications.length > 0}
  <div class="ed-publish-versions">
    {#each publications as pub, i (pub.chartPublication.id)}
      {@const isCurrent = i === 0}
      <div class="ed-version-row" class:is-current={isCurrent}>
        <div class="ed-version-head">
          <span class="ed-version-num">v.{pub.chartPublication.v}</span>
          <span class="ed-version-date">
            {dayjs(pub.chartPublication.created).format("YYYY-MM-DD HH:mm")}
          </span>
          {#if isCurrent}
            <span class="ed-version-tag">current</span>
          {/if}
          <a
            href={embedUrl(pub.chartPublication.id)}
            class="ed-version-preview"
            target="_blank"
            rel="noreferrer">Preview ↗</a
          >
        </div>
        <CopyField
          value={embedUrl(pub.chartPublication.id)}
          ariaLabel="Embed URL for v.{pub.chartPublication.v}"
        />
      </div>
    {/each}
  </div>
{:else}
  <p class="editor-sub-section-description">No published versions yet.</p>
{/if}

<div class="publish-action">
  <button class="btn-primary" onclick={onPublish}>
    + Publish new version{version != null ? ` (v.${version})` : ""}
  </button>
</div>

<h3 class="editor-sub-section">Export PNG</h3>
<p class="editor-sub-section-description">Static image for slides and documents.</p>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="publish-resolution">Resolution</label>
  </div>
  <div>
    <div id="publish-resolution" class="ed-segmented" role="radiogroup" aria-label="Image scale">
      {#each SCALES as s (s)}
        <button
          type="button"
          role="radio"
          aria-checked={imageScale === s}
          class="ed-segmented-opt"
          class:is-active={imageScale === s}
          onclick={() => (imageScale = s)}
        >
          {s}x
        </button>
      {/each}
    </div>
  </div>
</div>

<div class="publish-action">
  <button class="btn-primary" onclick={onGeneratePng}>Generate PNG</button>
</div>

<h3 class="editor-sub-section">Advanced</h3>

<EditorCollapsible key="json-export" label="Data Tortilla JSON export" lvl={2}>
  <p class="editor-sub-section-description">
    Move this chart between Data Tortilla instances. The JSON includes datasets, layout, and chart
    configuration. Most users don't need this — use Embed or PNG instead.
  </p>
  <CopyField value={jsonExport} ariaLabel="Chart JSON export" />
</EditorCollapsible>

<style>
  .publish-action {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  /* Versioned embed list */
  .ed-publish-versions {
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    overflow: hidden;
  }
  .ed-version-row {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ed-version-row:last-child {
    border-bottom: 0;
  }
  .ed-version-row.is-current {
    background: var(--accent-primary-wash);
  }
  .ed-version-head {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .ed-version-num {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--fg-primary);
  }
  .ed-version-date {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--fg-tertiary);
  }
  .ed-version-tag {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--accent-primary);
    color: var(--fg-on-accent);
  }
  .ed-version-preview {
    margin-left: auto;
    font-size: 0.85rem;
    color: var(--accent-primary);
    text-decoration: none;
  }
  .ed-version-preview:hover {
    text-decoration: underline;
  }

  /* Segmented scale picker */
  .ed-segmented {
    display: inline-flex;
    padding: 2px;
    background: var(--bg-sunken);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
  }
  .ed-segmented-opt {
    height: 26px;
    padding: 0 14px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 500;
    background: transparent;
    border: 0;
    border-radius: calc(var(--radius-sm) - 2px);
    color: var(--fg-secondary);
    cursor: pointer;
    transition:
      background var(--duration-micro) var(--ease-standard),
      color var(--duration-micro) var(--ease-standard);
  }
  .ed-segmented-opt:hover {
    color: var(--fg-primary);
  }
  .ed-segmented-opt.is-active {
    background: var(--bg-surface);
    color: var(--fg-primary);
    box-shadow: var(--shadow-1);
    font-weight: 600;
  }
</style>
