<script lang="ts">
  import { AxisLocation, AxisOrientation } from "$lib/chart";
  import type { axis } from "$lib/chartStore";
  import AxisGridEditor from "./AxisGridEditor.svelte";

  export let conf: ReturnType<typeof axis>;
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
    Orientation:
    <select
      value={$conf.orientation}
      on:change={(e) => conf.setOrientation(e.currentTarget.value)}
    >
      {#each Object.values(AxisOrientation) as orientation}
        <option>{orientation}</option>
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

<u>Major gridlines:</u>
<AxisGridEditor conf={conf.major} />

<u>Minor gridlines:</u>
<AxisGridEditor conf={conf.minor} />
