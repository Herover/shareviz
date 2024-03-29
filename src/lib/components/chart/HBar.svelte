<script lang="ts">
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import { formatNumber } from "$lib/utils";
  import { createEventDispatcher, onMount } from "svelte";
  import type { Root, HBar } from "$lib/chart";

  export let labelWidth: number;
  export let valueWidth: number;
  export let values: {
    label: string;
    value: { label: string; value: number }[];
  }[];
  export let chartSpec: Root;
  export let hBarSpec: HBar;
  export let label: string;
  export let showLegend: boolean;

  const dispatch = createEventDispatcher();

  const valueHeight = 20;
  const barMargin = 0;
  const blockMargin = 16;
  const scaleHeight = 16;
  let legendHeight = showLegend ? 24 : 0;

  $: bars =
    values.length != 0 && values[0].value.length != 0
      ? values[0].value.length
      : 0;
  $: barHeight = valueHeight - barMargin * 2;
  $: blockHeight = valueHeight * bars;

  $: valueScale = scaleLinear()
    .range([0, valueWidth])
    .domain(
      chartSpec.chart.scales.find((s) => s.dataKey == hBarSpec.value)
        ?.dataRange || [0, 1],
    );
  $: color = scaleOrdinal<string>()
    .domain(
      values.length != 0 && values[0].value.length != 0
        ? values[0].value.map((d) => d.label)
        : [],
    )
    .range(
      chartSpec.chart.scales.find(
        (s) => s.type == "categoriesColor" /* hBarSpec.subCategories */,
      )?.values || ["#000", "#888"],
    );

  onMount(() =>
    dispatch("size", {
      height:
        (blockHeight + blockMargin) * values.length -
        blockMargin +
        // bars * barMargin +
        legendHeight +
        scaleHeight,
    }),
  );
  $: dispatch("size", {
    height:
      (blockHeight + blockMargin) * values.length -
      blockMargin +
      // bars * barMargin +
      legendHeight +
      scaleHeight,
  });
  $: console.log("hbar", values);
</script>

<g transform="translate({0},{0})">
  {#if legendHeight != 0}
    {#if showLegend}
      {#each color.domain().map((d) => ({ k: d, c: color(d) })) as d, i}
        <rect x={i * 80} y={0} width={16} height={15} fill={d.c || ""} />
        <text x={i * 80 + 24} dominant-baseline="hanging">{d.k}</text>
      {/each}
    {/if}
  {/if}

  <text
    x={valueWidth + labelWidth}
    font-weight="bold"
    dominant-baseline="hanging"
    text-anchor="end">{label}</text
  >
</g>

<g transform="translate({labelWidth},{legendHeight})">
  <!-- <path d="m 0,0 l {valueWidth},0" stroke="black" stroke-width="1" /> -->

  {#each valueScale.ticks(3) as tick}
    <path
      d="m {valueScale(tick)},{scaleHeight} l 0,{(blockHeight + blockMargin) *
        values.length -
        blockMargin}"
      stroke="#aaaaaa"
      stroke-width="1"
    />
    {#if showLegend}
      <text
        text-anchor="middle"
        dominant-baseline="hanging"
        font-size={scaleHeight}
        x={valueScale(tick)}>{formatNumber(tick)}</text
      >
    {/if}
  {/each}
</g>

<g transform="translate({0},{scaleHeight + legendHeight})">
  {#each values as d, i}
    <g transform="translate({0},{i * (blockHeight + blockMargin)})">
      <text
        x={0}
        y={blockHeight / 2}
        dominant-baseline="middle"
        text-anchor="start">{d.label}</text
      >

      {#each d.value as dd, ii}
        <rect
          x={labelWidth}
          y={ii * valueHeight + barMargin}
          height={barHeight}
          width={valueScale(dd.value)}
          fill={color(dd.label)}
        >
          <title>{dd.label}: {dd.value}</title>
        </rect>
      {/each}
    </g>
  {/each}
</g>
