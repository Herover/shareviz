<script lang="ts">
  import { AxisLocation, AxisOrientation, AxisRepeatMode } from "$lib/chart";
  import type { axis } from "$lib/chartStore";
  import AxisGridEditor from "./AxisGridEditor.svelte";

  export let conf: ReturnType<typeof axis>;
  export let showRepeatControl = false;

  const repeatSettings = [
    { l: "Always show", k: AxisRepeatMode.ALL },
    { l: "Only on first", k: AxisRepeatMode.FIRST },
    { l: "Only on last", k: AxisRepeatMode.LAST },
  ]
</script>

<p>
  <label>
    Location:
    <select
      value={$conf.location}
      on:change={(e) => conf.setLocation(e.currentTarget.value)}
    >
      {#each Object.values(AxisLocation) as location}
        <option>{location}</option>
      {/each}
    </select>
  </label>
</p>

<p>
  <label>
    Label space:
    <input
      value={$conf.labelSpace}
      on:change={(e) => conf.setLabelSpace(Number.parseInt(e.currentTarget.value))}
    />
</p>

<p>
  <label>
    Repeat labels:
    <select
      value={$conf.repeat}
      on:change={(e) => conf.setRepeat(e.currentTarget.value)}
      disabled={!showRepeatControl}
    >
      {#each repeatSettings as repeat}
        <option value={repeat.k}>{repeat.l}</option>
      {/each}
    </select>
</p>

<u>Major gridlines:</u>
<AxisGridEditor conf={conf.major} />

<u>Minor gridlines:</u>
<AxisGridEditor conf={conf.minor} isMinor={true}/>
