<script lang="ts" module>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let radioGroups = 0;
</script>

<script lang="ts">
  import type { Config } from "vizzu";

  import { db } from "$lib/sharedbVizzu";
  import type { TableByRecords } from "vizzu/dist/types/data";
  import TextInput from "../TextInput.svelte";
  import RadioInput from "../RadioInput.svelte";
  import { orNumber } from "$lib/utils";

  interface Props {
    configChannel?: Config.Channel;
    configData: TableByRecords | undefined;
    title?: string;
    configScope: ReturnType<typeof db.channelScope>;
  }

  let { configChannel = {}, configData, title = "", configScope }: Props = $props();

  let showMore = $state(false);

  let axis = $derived(configChannel?.axis);
  let labels = $derived(configChannel?.labels);
  let ticks = $derived(configChannel?.ticks);
  let interlacing = $derived(configChannel?.interlacing);
  let guides = $derived(configChannel?.guides);
  let markerGuides = $derived(configChannel?.markerGuides);
</script>

<div class="holder">
  <p>
    {title}
    {#each configChannel?.set || [] as channel, i}
      <select value={channel} onchange={(e) => configScope.set(i, e.currentTarget.value)}>
        <option value={null}></option>
        {#each configData?.series || [] as series}
          <option value={series.name}>{series.name}</option>
        {/each}
      </select>
    {/each}<button
      onclick={() =>
        configScope.add(orNumber(configChannel?.set?.length), (configData?.series || [])[0].name)}
      >+</button
    >
  </p>

  <button class="show-more" onclick={() => (showMore = !showMore)}>
    {#if showMore}
      Show less
    {:else}
      Show more
    {/if}
  </button>

  {#if showMore}
    <div class="advanced">
      <label
        >Title <TextInput
          value={configChannel?.title}
          onChange={(val) => configScope.setTitle(val)}
        /></label
      >
      <p>Axis</p>
      <label
        ><RadioInput
          onChange={(val) => configScope.setAxis(val)}
          value={axis}
          group={title + "axis"}
          setValue={"auto"}
        />Auto</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setAxis(val)}
          value={axis}
          group={title + "axis"}
          setValue={true}
        />Yes</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setAxis(val)}
          value={axis}
          group={title + "axis"}
          setValue={false}
        />No</label
      >

      <p>Labels</p>
      <label
        ><RadioInput
          onChange={(val) => configScope.setLabels(val)}
          value={labels}
          group={title + "labels"}
          setValue={"auto"}
        />Auto</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setLabels(val)}
          value={labels}
          group={title + "labels"}
          setValue={true}
        />Yes</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setLabels(val)}
          value={labels}
          group={title + "labels"}
          setValue={false}
        />No</label
      >

      <p>Ticks</p>
      <label
        ><RadioInput
          onChange={(val) => configScope.setTicks(val)}
          value={ticks}
          group={title + "ticks"}
          setValue={"auto"}
        />Auto</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setTicks(val)}
          value={ticks}
          group={title + "ticks"}
          setValue={true}
        />Yes</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setTicks(val)}
          value={ticks}
          group={title + "ticks"}
          setValue={false}
        />No</label
      >

      <p>Interlacing</p>
      <label
        ><RadioInput
          onChange={(val) => configScope.setInterlacing(val)}
          value={interlacing}
          group={title + "interlacing"}
          setValue={"auto"}
        />Auto</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setInterlacing(val)}
          value={interlacing}
          group={title + "interlacing"}
          setValue={true}
        />Yes</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setInterlacing(val)}
          value={interlacing}
          group={title + "interlacing"}
          setValue={false}
        />No</label
      >

      <p>Guides</p>
      <label
        ><RadioInput
          onChange={(val) => configScope.setGuides(val)}
          value={guides}
          group={title + "guides"}
          setValue={"auto"}
        />Auto</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setGuides(val)}
          value={guides}
          group={title + "guides"}
          setValue={true}
        />Yes</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setGuides(val)}
          value={guides}
          group={title + "guides"}
          setValue={false}
        />No</label
      >

      <p>Marker Guides</p>
      <label
        ><RadioInput
          onChange={(val) => configScope.setMarkerGuides(val)}
          value={markerGuides}
          group={title + "markerGuides"}
          setValue={"auto"}
        />Auto</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setMarkerGuides(val)}
          value={markerGuides}
          group={title + "markerGuides"}
          setValue={true}
        />Yes</label
      >
      <label
        ><RadioInput
          onChange={(val) => configScope.setMarkerGuides(val)}
          value={markerGuides}
          group={title + "markerGuides"}
          setValue={false}
        />No</label
      >
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
