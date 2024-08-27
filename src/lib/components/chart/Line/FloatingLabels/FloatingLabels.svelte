<script lang="ts">
  import { LabelLocation, type LineStyleKey } from "$lib/chart";
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import FloatingLabel from "./FloatingLabel.svelte";

  export let lines: LineStyleKey[];
  export let xScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let yScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let editor = false;
</script>

{#each lines as line}
  {#if line.label.location == LabelLocation.Float}
    <FloatingLabel {xScale} {yScale} {line} {editor} on:edit />
  {/if}
{/each}
