<script lang="ts">
  import { run } from "svelte/legacy";

  /* eslint-disable */
  import { db } from "$lib/sharedbVizzu";
  import { createScope } from "$lib/dataScope";
  import { onDestroy, onMount } from "svelte";
  import Vizzu from "vizzu";
  // @ts-ignore
  import VizzuModule from "$lib/../../node_modules/vizzu/dist/cvizzu.wasm?url";
  import Config from "$lib/components/vizzu/Config.svelte";
  import type { TableByRecords } from "vizzu/dist/types/data";

  const disconnect = db.connect("1");

  let specs = $derived($db.doc ? $db.doc.specs : []);
  // $: data = $db.doc ? $db.doc.data.sets["Test"] : null;
  const data = createScope<TableByRecords>(db, "doc.data.sets.Test");
  let specIndex = $state(0);
  let currentSpec = $derived(createScope<any>(db, "doc.specs." + specIndex));
  run(() => {
    console.log("doc", $db.doc);
  });
  run(() => {
    console.log("currentSpec", $currentSpec);
  });
  run(() => {
    console.log("data", $data?.series);
  });

  let vizzuEl: HTMLElement = $state();
  Vizzu.options({ wasmUrl: VizzuModule });

  let chart: Vizzu | null = $state(null);
  onMount(() => {
    chart = new Vizzu(vizzuEl);
  });

  let i = $state(0);
  run(() => {
    if (chart != null && $data != null && i == 0) {
      chart.animate([{ target: { data: $data } }]);
      i++;
    }
  });
  run(() => {
    if (chart != null && $data != null && specs.length != 0) {
      chart.animate(specs[specIndex]);
    }
  });

  onDestroy(() => {
    chart?.detach();
    disconnect();
  });
</script>

<h1>Editor</h1>
<div bind:this={vizzuEl} class="chart"></div>
<p>
  {#each Array.from(Array(specs.length).keys()) as i}
    <button onclick={() => (specIndex = i)}>{i}</button>
  {/each}
</p>
{#each specs as _spec, index}
  <Config configChart={createScope(db, ["doc", "specs", index])} configData={$data} {index} />
{/each}
<button onclick={() => db.duplicateSpec(specs.length - 1, specs.length)}>+</button>

<pre>
{JSON.stringify(specs, null, 2)}
</pre>

<style>
  .chart {
    width: 600px;
    height: 400px;
  }
</style>
