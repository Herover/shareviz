<script lang="ts">
  import type { Line, Root } from "$lib/chart";
  import { formatNumber } from "$lib/utils";
  import { scaleLinear } from "d3-scale";
  import { line } from "d3-shape";

  export let values: {
    label: string;
    value: { x: number; y: number }[];
  }[];
  export let chartSpec: Root;
  export let lineSpec: Line;
  export let width: number;

  const height = 300;
  const labelWidth = 80;
  const topMargin = 24;
  const bottomMargin = 24;
  const leftMargin = 24;
  const rightMargin = 0;

  $: xScale = scaleLinear()
    .range([leftMargin, width - labelWidth - rightMargin])
    .domain(
      chartSpec.chart.scales.find((s) => s.name == lineSpec.x.scale)
        ?.dataRange ||
        console.warn("x scale not found") || [0, 1],
    );
  $: yScale = scaleLinear()
    .range([height - topMargin-bottomMargin, 0])
    .domain(
      chartSpec.chart.scales.find((s) => s.name == lineSpec.y.scale)
        ?.dataRange ||
        console.warn("y scale not found") || [0, 1],
    );

  $: draw = line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  $: console.log("line", values, yScale.domain());
</script>

<svg {width} {height}>
  <g transform="translate(0, {topMargin})">
    {#each yScale.ticks(3) as tick}
      <g transform="translate(0, {yScale(tick)})">
        <line x1={0} y1={0} x2={width} y2={0} stroke="#888888" />
        <text x={width - labelWidth + 16} y={-6}>{formatNumber(tick)}</text>
      </g>
    {/each}
    {#each xScale.ticks(3) as tick}
      <g transform="translate({xScale(tick)}, {height - topMargin - bottomMargin})">
        <line x1={0} y1={0} x2={0} y2={6} stroke="#888888" />
        <text x={0} y={6} dominant-baseline="hanging" text-anchor="middle">{tick}</text>
      </g>
    {/each}
    {#each values as d}
      <path d={draw(d.value)} stroke="black" stroke-width="3" fill="none" />
    {/each}
  </g>
</svg>
