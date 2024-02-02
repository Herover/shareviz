<script lang="ts" context="module">
  let radioGroups = 0;
</script>
<script lang="ts">
  import type { Config } from "vizzu";

  import { db } from "$lib/sharedb";
  import type { TableByRecords } from "vizzu/dist/types/data";

  export let configChannel: Config.Channel | undefined;
  export let configData: TableByRecords | undefined;
  export let title = "";
  export let configScope: ReturnType<typeof db.channelScope>;

  let showMore = false;
  const radioGroup = radioGroups++;

  let axis = configChannel?.axis;
  $: configScope.setAxis(axis);
  let labels = configChannel?.labels;
  $: configScope.setLabels(labels);
  let ticks = configChannel?.ticks;
  let interlacing = configChannel?.interlacing;
  let guides = configChannel?.guides;
  let markerGuides = configChannel?.markerGuides;
</script>

<div class="holder">
  <p>
    {title}
    {#each configChannel?.set || [] as channel, i}
      <select value={channel} on:change={e => configScope.set(i, e.currentTarget.value)}>
        <option value={null}></option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}<button on:click={() => configScope.add(configChannel?.set?.length || 0, (configData?.series || [])[0].name)}>+</button>
  </p>

  <button class="show-more" on:click={() => showMore = !showMore}>
    {#if showMore}
      Show less
    {:else}
      Show more
    {/if}
  </button>

  {#if showMore}
    <div class="advanced">
      <p>Axis</p>
      <label><input bind:group={axis} type="radio" name="{"axis"+radioGroup}" value={"auto"}/>Auto</label>
      <label><input bind:group={axis} type="radio" name="{"axis"+radioGroup}" value={true}/>Yes</label>
      <label><input bind:group={axis} type="radio" name="{"axis"+radioGroup}" value={false}/>No</label>

      <p>Labels</p>
      <label><input bind:group={labels} type="radio" name="{"labels"+radioGroup}" value={"auto"}/>Auto</label>
      <label><input bind:group={labels} type="radio" name="{"labels"+radioGroup}" value="{true}"/>Yes</label>
      <label><input bind:group={labels} type="radio" name="{"labels"+radioGroup}" value="{false}"/>No</label>

      <p>Ticks</p>
      <label><input bind:group={ticks} type="radio" name="{"ticks"+radioGroup}" value={"auto"}/>Auto</label>
      <label><input bind:group={ticks} type="radio" name="{"ticks"+radioGroup}" value="{true}"/>Yes</label>
      <label><input bind:group={ticks} type="radio" name="{"ticks"+radioGroup}" value="{false}"/>No</label>

      <p>Interlacing</p>
      <label><input bind:group={interlacing} type="radio" name="{"interlacing"+radioGroup}" value={"auto"}/>Auto</label>
      <label><input bind:group={interlacing} type="radio" name="{"interlacing"+radioGroup}" value="{true}"/>Yes</label>
      <label><input bind:group={interlacing} type="radio" name="{"interlacing"+radioGroup}" value="{false}"/>No</label>

      <p>Guides</p>
      <label><input bind:group={guides} type="radio" name="{"guides"+radioGroup}" value={"auto"}/>Auto</label>
      <label><input bind:group={guides} type="radio" name="{"guides"+radioGroup}" value="{true}"/>Yes</label>
      <label><input bind:group={guides} type="radio" name="{"guides"+radioGroup}" value="{false}"/>No</label>

      <p>Marker Guides</p>
      <label><input bind:group={markerGuides} type="radio" name="{"markerGuides"+radioGroup}" value={"auto"}/>Auto</label>
      <label><input bind:group={markerGuides} type="radio" name="{"markerGuides"+radioGroup}" value="{true}"/>Yes</label>
      <label><input bind:group={markerGuides} type="radio" name="{"markerGuides"+radioGroup}" value="{false}"/>No</label>
    </div>
  {/if}
</div>

<style>
  .holder {
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    border: 1px solid;
  }
  /* button, select {
    width: 100%;
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  } */
  .advanced p {
    margin-bottom: 0px;
  }
  .show-more {
    text-align: center;
    margin: auto;
    font-size: 0.8em;
    color: gray;
    background-color: white;
    border: none;
  }
</style>