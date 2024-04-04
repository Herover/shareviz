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
  let legendHeight = showLegend ? 0 : -16;

  $: bars =
    values.length != 0 && values[0].value.length != 0
      ? values[0].value.length
      : 0;
  $: barHeight = valueHeight - barMargin * 2;
  $: blockHeight = valueHeight * bars;

  $: valueScale = scaleLinear()
    .range([0, valueWidth])
    .domain(
      chartSpec.chart.scales.find((s) => s.name == hBarSpec.scale)
        ?.dataRange || [0, 1],
    );
  // "#ff8888", "#aa2222"
  $: colors = chartSpec.chart.scales.find((s) => s.name == "color")?.colors ||
    console.warn("color scale not found") || {
      default: "#888",
      byKey: [],
    };
  $: color = (d: { label: string }) => {
    const c = colors.byKey.find((e) => e.k == d.label);
    if (c) {
      return c.c;
    }
    return colors.default;
  };

  $: height =
    (blockHeight + blockMargin) * values.length -
    blockMargin +
    // bars * barMargin +
    legendHeight +
    scaleHeight;
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

<div class="legend">
  {#if showLegend}
    <p class="legend-left">
      {#each colors.byKey as d}
        {#if d.legend}
          <div style="background-color:{d.c}" class="legend-box" />
          <span>{d.legend}</span>
        {/if}
      {/each}
    </p>
  {/if}

  <p style="font-weight:bold;" class="legend-right">
    {label}
  </p>
</div>

<svg width={valueWidth + labelWidth} {height}>
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
            fill={color(dd)}
          >
            <title>{dd.label}: {dd.value}</title>
          </rect>
        {/each}
      </g>
    {/each}
  </g>
</svg>

<style>
  .legend {
    display: flex;
  }
  .legend-right {
    margin-left: auto;
  }
  .legend-box {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 4px;
    margin-left: 4px;
    position: relative;
    top: 0.1em;
  }
</style>
