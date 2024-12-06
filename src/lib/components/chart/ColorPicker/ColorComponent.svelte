<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { orNumber } from "$lib/utils";
  import chroma from "chroma-js";

  interface Props {
    h: number;
    c: number;
    l: number;
    title: string;
  }

  let { h, c, l, title }: Props = $props();

  let l2 = $derived(Math.floor(Math.max(Math.min(orNumber(l), 100), 0)));
  let c2 = $derived(Math.floor(Math.max(Math.min(orNumber(c), 100), 0)));
  let h2 = $derived(Math.floor((orNumber(h) + 360) % 360));
  let lch = $derived(`oklch(${l2}% ${c2}% ${h2}deg)`);

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
  onclick={() => dispatch("click", lch)}
  onkeydown={onKey}
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
