<script lang="ts">
  import chroma from "chroma-js";
  import { createEventDispatcher } from "svelte";

  export let h: number;
  export let c: number;
  export let l: number;

  $: hex = chroma(h, c, l, "hcl").hex();

  const dispatch = createEventDispatcher<{ click: string }>();
</script>

<div
  style:background-color={`${hex}`}
  on:click={() => dispatch("click", hex)}
  on:keydown={() => dispatch("click", hex)}
  class="color-component"
  role="button"
  tabindex="0"
></div>

<style>
  .color-component {
    width: 33.3%;
    height: 2em;
    display: inline-block;
    cursor: pointer;
  }
</style>
