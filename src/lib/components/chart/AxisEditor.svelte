<script lang="ts">
  import { AxisLocation, AxisRepeatMode } from "$lib/chart";
  import type { axis } from "$lib/chartStore";
  import AxisGridEditor from "./AxisGridEditor.svelte";

  interface Props {
    conf: ReturnType<typeof axis>;
    showRepeatControl?: boolean;
  }

  let { conf, showRepeatControl = false }: Props = $props();

  const repeatSettings = [
    { l: "Always show", k: AxisRepeatMode.ALL },
    { l: "Only on first", k: AxisRepeatMode.FIRST },
    { l: "Only on last", k: AxisRepeatMode.LAST },
  ];
</script>

<p>
  <label>
    Location:
    <select value={$conf.location} onchange={(e) => conf.setLocation(e.currentTarget.value)}>
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
      onchange={(e) => conf.setLabelSpace(Number.parseInt(e.currentTarget.value))}
    />
  </label>
</p>

<p>
  <label>
    Repeat labels:
    <select
      value={$conf.repeat}
      onchange={(e) => conf.setRepeat(e.currentTarget.value)}
      disabled={!showRepeatControl}
    >
      {#each repeatSettings as repeat}
        <option value={repeat.k}>{repeat.l}</option>
      {/each}
    </select>
  </label>
</p>

<u>Major gridlines:</u>
<AxisGridEditor conf={conf.major} />

<u>Minor gridlines:</u>
<AxisGridEditor conf={conf.minor} isMinor={true} />
