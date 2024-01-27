<script lang="ts">
  import { Chart, Config } from "vizzu";
  import type { SeriesMetaInfo, TableByRecords } from "vizzu/dist/types/data";

  import { db } from "$lib/sharedb";

  export let configChart: Config.Chart;
  export let configData: TableByRecords;
  export let index: number;
</script>

<div class="holder">
  <p>Title <input value={configChart.title} on:change={e => db.setConfigTitle(index, e.currentTarget.value)}/></p>

  <p>
    X
    {#each configChart?.channels?.x?.set || [] as channel, i}
      <select value={channel} on:change={e => db.setConfigX(index, i, e.currentTarget.value)}>
        <option value={null}>Remove</option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}
    <button on:click={() => db.addConfigX(index, configChart?.channels?.x?.set?.length || 0, (configData?.series || [])[0].name)}>+</button>
  </p>

  <p>
    Y
    {#each configChart?.channels?.y?.set || [] as channel, i}
      <select value={channel} on:change={e => db.setConfigY(index, i, e.currentTarget.value)}>
        <option value={null}></option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}
    <button on:click={() => db.addConfigY(index, configChart?.channels?.y?.set?.length || 0, (configData?.series || [])[0].name)}>+</button>
  </p>

  <p>
    Color
    {#each configChart?.channels?.color?.set || [] as channel, i}
      <select value={channel} on:change={e => db.setConfigColor(index, i, e.currentTarget.value)}>
        <option value={null}></option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}
    <button on:click={() => db.addConfigColor(index, configChart?.channels?.color?.set?.length || 0, (configData?.series || [])[0].name)}>+</button>
  </p>

  <p>
    Label
    {#each configChart?.channels?.label?.set || [] as channel, i}
      <select value={channel} on:change={e => db.setConfigLabel(index, i, e.currentTarget.value)}>
        <option value={null}></option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}
    <button on:click={() => db.addConfigLabel(index, configChart?.channels?.label?.set?.length || 0, (configData?.series || [])[0].name)}>+</button>
  </p>

  <p>
    Geometry
    <select value={configChart.geometry} on:change={e => db.setConfigGeometry(index, e.currentTarget.value)}>
      {#each ['rectangle', 'circle', 'area', 'line'] as geom}
        <option value={geom}>{geom}</option>
      {/each}
    </select>
  </p>

  <p>
    Coordinate system
    <select value={configChart.coordSystem} on:change={e => db.setConfigCoordSystem(index, e.currentTarget.value)}>
      {#each ['cartesian', 'polar'] as coord}
        <option value={coord}>{coord}</option>
      {/each}
    </select>
  </p>
</div>

<style>
  .holder {
    border: 1px solid black;
  }
</style>