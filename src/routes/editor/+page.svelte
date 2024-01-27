<h1>Editor</h1>
<div bind:this={vizzuEl} class="chart"></div>
<p>
  {#each Array.from(Array(specs.length).keys()) as i}
    <button on:click={() => specIndex = i}>{i}</button>
  {/each}
</p>
{#each specs as spec, index}
  <Config configChart={spec} configData={data} {index}/>
{/each}
<button on:click={() => db.duplicateSpec(specs.length-1, specs.length)}>+</button>

<pre>
{JSON.stringify(specs, null, 2)}
</pre>

<style>
  .chart {
    width: 600px;
    height: 400px;
  }
</style>

<script lang="ts">
	import { db } from '$lib/sharedb';
	import { onDestroy, onMount } from 'svelte';
  import Vizzu from 'vizzu';
  // @ts-ignore
  import VizzuModule from '$lib/../../node_modules/vizzu/dist/cvizzu.wasm?url'
  import Config from '$lib/components/Config.svelte';

  const disconnect = db.connect('1');

  $: specs = $db.doc ? $db.doc.specs : [];
  $: data = $db.doc ? $db.doc.data.sets["Test"] : null;
  let specIndex = 0;
  $: console.log("doc", $db.doc);
  
  let vizzuEl: HTMLElement;
  Vizzu.options({ wasmUrl: VizzuModule })

  let chart: Vizzu | null = null;
  onMount(() => {
    chart = new Vizzu(vizzuEl);
  });
  
  let i = 0
  $: if (chart != null && data != null && i == 0) {
    chart.animate([{ target: { data } }]);
    i++
  };
  $: if (chart != null && specs.length != 0) {
    chart.animate(specs[specIndex]);
  };


  onDestroy(() => {
    chart?.detach();
    disconnect();
  });
</script>
