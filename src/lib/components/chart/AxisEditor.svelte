<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { AxisLocation, AxisRepeatMode } from "$lib/chart";
  import type { AxisStore } from "$lib/chartStores/axis.svelte";
  import type { PresenceAddress, ShareDBConnection } from "$lib/chartStores/data.svelte";
  import AxisGridEditor from "./AxisGridEditor.svelte";
  import PresenceField from "./PresenceField.svelte";

  interface Props {
    conf: AxisStore;
    connection: ShareDBConnection | undefined;
    /** Stable, id-based address prefix for this axis, e.g. ["chart","elements",<id>,"d","axis"]. */
    address: PresenceAddress;
    showRepeatControl?: boolean;
    idPrefix?: string;
  }

  let { conf, connection, address, showRepeatControl = false, idPrefix = "" }: Props = $props();

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
    <PresenceField address={[...address, "location"]} {connection}>
      {#snippet field({ locked })}
        <select
          id="{idPrefix}axis-location"
          value={conf.data.location}
          disabled={locked}
          onchange={(e) => conf.setLocation(e.currentTarget.value)}
        >
          {#each Object.values(AxisLocation) as location (location)}
            <option>{location}</option>
          {/each}
        </select>
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}axis-label-space">Label space</label>
  </div>
  <div>
    <PresenceField address={[...address, "labelSpace"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="{idPrefix}axis-label-space"
          type="number"
          value={conf.data.labelSpace}
          readonly={locked}
          onchange={(e) => conf.setLabelSpace(Number.parseInt(e.currentTarget.value))}
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}axis-repeat-labels">Repeat labels</label>
  </div>
  <div>
    <PresenceField address={[...address, "repeat"]} {connection}>
      {#snippet field({ locked })}
        <select
          id="{idPrefix}axis-repeat-labels"
          value={conf.data.repeat}
          onchange={(e) => conf.setRepeat(e.currentTarget.value)}
          disabled={!showRepeatControl || locked}
        >
          {#each repeatSettings as repeat (repeat.k)}
            <option value={repeat.k}>{repeat.l}</option>
          {/each}
        </select>
      {/snippet}
    </PresenceField>
  </div>
</div>

<h4>Major gridlines</h4>
<AxisGridEditor
  conf={conf.major()}
  {connection}
  address={[...address, "major"]}
  idPrefix="{idPrefix}major-"
/>

<h4>Minor gridlines</h4>
<AxisGridEditor
  conf={conf.minor()}
  {connection}
  address={[...address, "minor"]}
  isMinor={true}
  idPrefix="{idPrefix}minor-"
/>
