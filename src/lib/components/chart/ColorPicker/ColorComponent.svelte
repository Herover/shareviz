<script lang="ts">
  import chroma from "chroma-js";
  import { createEventDispatcher } from "svelte";

  export let h: number;
  export let c: number;
  export let l: number;
  export let title: string;

  $: lch = `lch(${Math.max(Math.min(l || 0, 100), 0)}% ${Math.max(Math.min(c || 0, 100), 0)} ${((h || 0) + 360) % 360})`;

  const dispatch = createEventDispatcher<{ click: string }>();
  const onKey = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      dispatch("click", lch);
    }
  };
</script>

<div
  style:background-color={`${lch}`}
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
