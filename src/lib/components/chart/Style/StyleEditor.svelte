<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { ChartStore } from "$lib/chartStores/chart.svelte";
  import { StyleStore } from "$lib/chartStores/style.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";
  import PresenceField from "../PresenceField.svelte";
  import RichTextField from "../RichTextField.svelte";
  import { untrack } from "svelte";

  interface Props {
    connection: ShareDBConnection;
  }

  let { connection }: Props = $props();

  let chartStore = untrack(() => new ChartStore(connection));
  let styletStore = untrack(() => new StyleStore(connection));

  const cssExample = `.chart {
  --background-color: #ffffff;
  --text-primary-color: #000000;
  --text-mute-color: #888888;
  --chart-padding-left: 16px;
  --chart-padding-right: 16px;
  --chart-padding-top: 16px;
  --chart-padding-bottom: 16px;

  --axis-line-color: #aaaaaa;
  --axis-text-size: 0.9em;
}`;
</script>

<h3 class="editor-sub-section">Labels</h3>

<!-- Rich text fields go full-width with the label in their header (unlike the short
     fields below): the editor needs the room, and merges concurrent edits instead of locking. -->
<RichTextField {connection} path={["chart", "title"]} defaultBlock="h1" label="Title" />

<RichTextField {connection} path={["chart", "subTitle"]} defaultBlock="p" label="Sub title" />

<!-- Source text + link collapse into one paired row per side: display text and URL
     side by side, each still individually presence-guarded. The label keeps the shared
     editor-row layout so it lines up with the other fields. -->
<div class="editor-row">
  <div class="editor-column-label">
    <label for="editor-source-text-left">Source (left)</label>
  </div>
  <div class="row-pair">
    <PresenceField address={["chart", "sourceTextLeft"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="editor-source-text-left"
          class="input"
          value={chartStore.data?.sourceTextLeft}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextLeft(e.currentTarget.value)}
          type="text"
          placeholder="Display text"
          aria-label="Source text (left)"
        />
      {/snippet}
    </PresenceField>
    <PresenceField address={["chart", "sourceTextLeftLink"]} {connection}>
      {#snippet field({ locked })}
        <input
          class="input"
          value={chartStore.data?.sourceTextLeftLink}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextLeftLink(e.currentTarget.value)}
          type="text"
          placeholder="URL"
          aria-label="Source link (left)"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="editor-source-text-right">Source (right)</label>
  </div>
  <div class="row-pair">
    <PresenceField address={["chart", "sourceTextRight"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="editor-source-text-right"
          class="input"
          value={chartStore.data?.sourceTextRight}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextRight(e.currentTarget.value)}
          type="text"
          placeholder="Display text"
          aria-label="Source text (right)"
        />
      {/snippet}
    </PresenceField>
    <PresenceField address={["chart", "sourceTextRightLink"]} {connection}>
      {#snippet field({ locked })}
        <input
          class="input"
          value={chartStore.data?.sourceTextRightLink}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextRightLink(e.currentTarget.value)}
          type="text"
          placeholder="URL"
          aria-label="Source link (right)"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="style-height">Height</label>
  </div>
  <div>
    <PresenceField address={["chart", "height"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="style-height"
          value={chartStore.data?.height}
          readonly={locked}
          onkeyup={(e) => chartStore.setConfigHeight(Number.parseInt(e.currentTarget.value))}
          onchange={(e) => chartStore.setConfigHeight(Number.parseInt(e.currentTarget.value))}
          type="number"
          class="control"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="style-width">Width</label>
  </div>
  <div>
    <PresenceField address={["chart", "width"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="style-width"
          value={chartStore.data?.width}
          readonly={locked}
          onkeyup={(e) => chartStore.setConfigWidth(Number.parseInt(e.currentTarget.value))}
          onchange={(e) => chartStore.setConfigWidth(Number.parseInt(e.currentTarget.value))}
          type="number"
          class="control"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<h3 class="editor-sub-section">Style</h3>

<p><label for="style-overrides">Style overrides</label></p>

<div class="style-warning" style="color: var(--color-warm-900)">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
    />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
  <span>
    Override the chart's CSS variables directly. This is a advanced unstable feature that may change
    in the future.
  </span>
</div>

<pre class="style-example">{cssExample}</pre>

<PresenceField address={["style", "css"]} {connection}>
  {#snippet field({ locked })}
    <textarea
      id="style-overrides"
      class="style-code"
      rows="12"
      spellcheck="false"
      readonly={locked}
      onchange={(e) => styletStore.setCSS(e.currentTarget.value)}
      onkeyup={(e) => styletStore.setCSS(e.currentTarget.value)}>{styletStore.data?.css}</textarea
    >
  {/snippet}
</PresenceField>

<style>
  .control {
    width: 100%;
    box-sizing: border-box;
  }
  textarea {
    resize: vertical;
  }

  /* A side-by-side pair of inputs in the content cell of an editor-row (e.g. source
     display text + URL). */
  .row-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .input {
    width: 100%;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--fg-primary);
    transition:
      border-color var(--duration-micro) var(--ease-standard),
      box-shadow var(--duration-micro) var(--ease-standard);
  }
  .input:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--border-focus) 25%, transparent);
  }
  .input::placeholder {
    color: var(--fg-tertiary);
  }

  /* Style overrides — a plain, un-highlighted code surface (see the date-parser
     examples): the template is shown as monospace text, the editor is a mono textarea. */
  .style-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    margin-bottom: 12px;
    background: var(--state-warning-bg);
    border: 1px solid color-mix(in oklab, var(--state-warning) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--fg-primary);
    font-size: var(--text-sm);
    line-height: 1.4;
  }
  .style-warning svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--state-warning);
  }
  .style-example {
    margin: 0 0 8px;
    padding: 10px 12px;
    background: var(--bg-sunken);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.55;
    color: var(--fg-secondary);
    overflow-x: auto;
  }
  .style-code {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.55;
  }
</style>
