<script lang="ts">
  import { Config } from "vizzu";
  import type { TableByRecords } from "vizzu/dist/types/data";

  import { db } from "$lib/sharedbVizzu";
	import { createScope } from '$lib/dataScope';
  import Channel from "./Channel.svelte";
  import TextInput from "../TextInput.svelte";

  interface Props {
    configChart: ReturnType<typeof createScope<Config.Chart>>;
    configData: TableByRecords | undefined;
    index: number;
  }

  let { configChart, configData, index }: Props = $props();
</script>

<div class="holder">
  <p><label>Title <TextInput value={$configChart?.title} onChange={(val) => db.setConfigTitle(index, val)}/></label></p>

<!--   <p>
    X
    {#each $configChart?.channels?.x?.set || [] as channel, i}
      <select value={channel} on:change={e => db.setConfigX(index, i, e.currentTarget.value)}>
        <option value={null}></option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}
    <button on:click={() => db.addConfigX(index, $configChart?.channels?.x?.set?.length || 0, (configData?.series || [])[0].name)}>+</button>
  </p> -->
  <Channel
    title="X"
    configChannel={$configChart?.channels?.x}
    {configData}
    configScope={db.channelScope(index, "x")}
  />
  <Channel
    title="Y"
    configChannel={$configChart?.channels?.y}
    {configData}
    configScope={db.channelScope(index, "y")}
  />
  <Channel
    title="Color"
    configChannel={$configChart?.channels?.color}
    {configData}
    configScope={db.channelScope(index, "color")}
  />
  <Channel
    title="Label"
    configChannel={$configChart?.channels?.label}
    {configData}
    configScope={db.channelScope(index, "label")}
  />
  <Channel
    title="Size"
    configChannel={$configChart?.channels?.size}
    {configData}
    configScope={db.channelScope(index, "size")}
  />

  <p>
    Geometry
    <select value={$configChart?.geometry} onchange={e => db.setConfigGeometry(index, e.currentTarget.value)}>
      {#each ['rectangle', 'circle', 'area', 'line'] as geom}
        <option value={geom}>{geom}</option>
      {/each}
    </select>
  </p>

  <p>
    Coordinate system
    <select value={$configChart?.coordSystem} onchange={e => db.setConfigCoordSystem(index, e.currentTarget.value)}>
      {#each ['cartesian', 'polar'] as coord}
        <option value={coord}>{coord}</option>
      {/each}
    </select>
  </p>
</div>

<style>
  .holder {
    border: 1px solid black;
    width: 240px;
  }
</style>