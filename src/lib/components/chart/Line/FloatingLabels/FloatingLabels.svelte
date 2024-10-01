<script lang="ts">
  import { LabelLocation, type LineStyleKey } from "$lib/chart";
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import FloatingLabel from "./FloatingLabel.svelte";
  import { createEventDispatcher } from "svelte";

  export let lines: LineStyleKey[];
  export let xScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let yScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let editor = false;

  const dispatch = createEventDispatcher<{
    edit: any[];
  }>();
</script>

{#each lines as line, i}
  {#if line.label.location == LabelLocation.Float}
    <FloatingLabel
      {xScale}
      {yScale}
      {line}
      {editor}
      on:edit={(e) => dispatch("edit", [i, ...e.detail])}
    />
  {/if}
{/each}
