<script lang="ts">
  import { LabelStyleLine, type LineStyleKey } from "$lib/chart";
  import type { ScaleLinear, ScaleTime } from "d3-scale";

  export let lines: LineStyleKey[];
  export let xScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let yScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  const boxes: { width: number; height: number }[] = [];
</script>

{#each lines as line}
  <g transform="translate({xScale(line.label.x)}, {yScale(line.label.y)})">
    <text
      x={line.label.rx}
      y={line.label.ry - 8}
      fill={line.color}
      bind:contentRect={boxes[i]}
      paint-order="stroke"
      stroke="#ffffff"
      stroke-width="3"
      text-anchor="middle">{line.label.text}</text
    >
    {#if line.label.line == LabelStyleLine.Line}
      {#if line.label.ry < 0}
        <line
          x2={line.label.rx}
          y2={line.label.ry}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {:else if line.label.ry > 24}
        <line
          x2={line.label.rx}
          y2={line.label.ry - 24}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {:else if line.label.rx < 0}
        <line
          x2={line.label.rx + boxes[i]?.width / 2 + 8}
          y2={line.label.ry - boxes[i]?.height / 2}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {:else if line.label.rx > 0}
        <line
          x2={line.label.rx - boxes[i]?.width / 2 - 8}
          y2={line.label.ry - boxes[i]?.height / 2}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {/if}
    {/if}
  </g>
{/each}
