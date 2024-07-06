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
</script>

{#each lines as line}
  <g transform="translate({xScale(line.label.x)}, {yScale(line.label.y)})">
    <text
      x={line.label.rx}
      y={line.label.ry - 8}
      fill={line.color}
      text-anchor="middle">{line.label.text}</text
    >
    {#if line.label.line == LabelStyleLine.Line}
      <line
        x2={line.label.rx}
        y2={line.label.ry}
        stroke="#000000"
        stroke-width={2}
        stroke-linecap="round"
      />
    {/if}
  </g>
{/each}
