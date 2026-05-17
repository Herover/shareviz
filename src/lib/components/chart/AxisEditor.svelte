<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { AxisLocation, AxisRepeatMode } from "$lib/chart";
  import type { AxisStore } from "$lib/chartStores/axis.svelte";
  import AxisGridEditor from "./AxisGridEditor.svelte";

  interface Props {
    conf: AxisStore;
    showRepeatControl?: boolean;
    idPrefix?: string;
  }

  let { conf, showRepeatControl = false, idPrefix = "" }: Props = $props();

  const repeatSettings = [
    { l: "Always show", k: AxisRepeatMode.ALL },
    { l: "Only on first", k: AxisRepeatMode.FIRST },
    { l: "Only on last", k: AxisRepeatMode.LAST },
  ];
</script>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}axis-location">Location</label>
  </div>
  <div>
    <select
      id="{idPrefix}axis-location"
      value={conf.data.location}
      onchange={(e) => conf.setLocation(e.currentTarget.value)}
    >
      {#each Object.values(AxisLocation) as location (location)}
        <option>{location}</option>
      {/each}
    </select>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}axis-label-space">Label space</label>
  </div>
  <div>
    <input
      id="{idPrefix}axis-label-space"
      type="number"
      value={conf.data.labelSpace}
      onchange={(e) => conf.setLabelSpace(Number.parseInt(e.currentTarget.value))}
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}axis-repeat-labels">Repeat labels</label>
  </div>
  <div>
    <select
      id="{idPrefix}axis-repeat-labels"
      value={conf.data.repeat}
      onchange={(e) => conf.setRepeat(e.currentTarget.value)}
      disabled={!showRepeatControl}
    >
      {#each repeatSettings as repeat (repeat.k)}
        <option value={repeat.k}>{repeat.l}</option>
      {/each}
    </select>
  </div>
</div>

<h4>Major gridlines</h4>
<AxisGridEditor conf={conf.major()} idPrefix="{idPrefix}major-" />

<h4>Minor gridlines</h4>
<AxisGridEditor conf={conf.minor()} isMinor={true} idPrefix="{idPrefix}minor-" />
