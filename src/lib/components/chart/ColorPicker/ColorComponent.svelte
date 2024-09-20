<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { orNumber } from "$lib/utils";
  import chroma from "chroma-js";

  export let h: number;
  export let c: number;
  export let l: number;
  export let title: string;

  $: l2 = Math.floor(Math.max(Math.min(orNumber(l), 100), 0));
  $: c2 = Math.floor(Math.max(Math.min(orNumber(c), 100), 0));
  $: h2 = Math.floor((orNumber(h) + 360) % 360);
  $: lch = `oklch(${l2}% ${c2}% ${h2}deg)`;

  const dispatch = createEventDispatcher<{ click: string }>();
  const onKey = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      dispatch("click", lch);
    }
  };
</script>

<div
  style:background-color={`${chroma(lch).hex()}`}
  on:click={() => dispatch("click", lch)}
  on:keydown={onKey}
  {title}
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
