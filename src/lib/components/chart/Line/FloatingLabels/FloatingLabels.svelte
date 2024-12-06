<script lang="ts">
  import { LabelLocation, type LineStyleKey } from "$lib/chart";
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import FloatingLabel from "./FloatingLabel.svelte";
  import { createEventDispatcher } from "svelte";

  interface Props {
    lines: LineStyleKey[];
    xScale: ScaleLinear<number, number, never> | ScaleTime<number, number, never>;
    yScale: ScaleLinear<number, number, never> | ScaleTime<number, number, never>;
    editor?: boolean;
  }

  let { lines, xScale, yScale, editor = false }: Props = $props();

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
