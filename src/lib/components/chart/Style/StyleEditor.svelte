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

<div class="editor-row">
  <div class="editor-column-label">
    <span>Title</span>
  </div>
  <div>
    <!-- Rich text: merges concurrent edits instead of locking, unlike the fields below. -->
    <RichTextField {connection} path={["chart", "title"]} />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Sub title</span>
  </div>
  <div>
    <RichTextField {connection} path={["chart", "subTitle"]} />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="editor-source-text-left">Source text (left)</label>
  </div>
  <div>
    <PresenceField address={["chart", "sourceTextLeft"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="editor-source-text-left"
          value={chartStore.data?.sourceTextLeft}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextLeft(e.currentTarget.value)}
          type="text"
          class="control"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="editor-source-link-left">Source link (left)</label>
  </div>
  <div>
    <PresenceField address={["chart", "sourceTextLeftLink"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="editor-source-link-left"
          value={chartStore.data?.sourceTextLeftLink}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextLeftLink(e.currentTarget.value)}
          type="text"
          class="control"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="editor-source-text-right">Source text (right)</label>
  </div>
  <div>
    <PresenceField address={["chart", "sourceTextRight"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="editor-source-text-right"
          value={chartStore.data?.sourceTextRight}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextRight(e.currentTarget.value)}
          type="text"
          class="control"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="editor-source-link-right">Source link (right)</label>
  </div>
  <div>
    <PresenceField address={["chart", "sourceTextRightLink"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="editor-source-link-right"
          value={chartStore.data?.sourceTextRightLink}
          readonly={locked}
          onkeyup={(e) => chartStore.setSourceTextRightLink(e.currentTarget.value)}
          type="text"
          class="control"
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
<p class="editor-sub-section-description">Override css, use on own risk!</p>
<pre class="editor-sub-section-description">{cssExample}</pre>
<PresenceField address={["style", "css"]} {connection}>
  {#snippet field({ locked })}
    <textarea
      id="style-overrides"
      rows="10"
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
</style>
