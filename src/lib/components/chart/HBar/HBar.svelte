<script lang="ts">
  import { scaleLinear } from "d3-scale";
  import { createEventDispatcher, onMount } from "svelte";
  import type { Root, HBar } from "$lib/chart";
  import { AxisLocation } from "$lib/chart";
  import Axis from "../Axis.svelte";
  import HBarLine from "./HBarLine.svelte";

  export let labelWidth: number;
  export let valueWidth: number;
  export let values: {
    label: string;
    value: { label: string; value: number; from: number; to: number }[];
  }[];
  // eslint-disable-next-line svelte/valid-compile
  export let chartSpec: Root;
  export let hBarSpec: HBar;
  export let label: string;
  export let showLegend: boolean;
  export let showAxisLabels: boolean;
  export let width: number;

  const dispatch = createEventDispatcher<{
    size: {
      height: number;
    };
    labelOverflow: number;
  }>();

  const valueHeight = 26;
  const barMargin = 0;
  const blockMargin = 16;
  let legendHeight = 0;

  let labelOverflows: number[] = [];
  $: labelOverflows = labelOverflows.slice(0, values.length);
  $: dispatch(
    "labelOverflow",
    labelOverflows.reduce((acc, n) => Math.max(acc, n), 0),
  );

  $: scaleHeight =
    !showAxisLabels || hBarSpec.axis.location == AxisLocation.NONE ? 0 : 16;

  $: bars =
    values.length != 0 && values[0].value.length != 0
      ? values[0].value.length
      : 0;
  $: barHeight = valueHeight - barMargin * 2;
  $: blockHeight = (hBarSpec.stackSubCategories ? 1 : bars) * valueHeight;

  $: valueScale = scaleLinear()
    .range([0, valueWidth])
    .domain(
      hBarSpec.portionSubCategories
        ? [0, 1]
        : hBarSpec.scale.dataRange || [0, 1],
    );
  // "#ff8888", "#aa2222"
  $: color = (d: { label: string }) => {
    const c = hBarSpec.colors.byKey.find((e) => e.k == d.label);
    if (c) {
      return c.c;
    }
    return hBarSpec.colors.default;
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
</script>

{#if showLegend}
  <p>
    {#each hBarSpec.colors.byKey as d}
      {#if d.legend != "" && d.k != ""}
        <span class="legend-title"
          ><div style="background-color:{d.c}" class="legend-box"></div>
          {d.legend}</span
        >
      {/if}
    {/each}
  </p>
{/if}

<p style="font-weight:bold;">
  {label}
</p>

<svg {width} {height}>
  <g transform="translate({labelWidth},{0})">
    <Axis
      width={valueWidth}
      height={(blockHeight + blockMargin) * values.length - blockMargin}
      scale={valueScale}
      conf={hBarSpec.axis}
      showLabels={showAxisLabels}
    />
  </g>

  <g
    transform="translate({0},{hBarSpec.axis.location == AxisLocation.START
      ? scaleHeight
      : 0})"
  >
    {#each values as d, i}
      <HBarLine
        conf={hBarSpec}
        {i}
        {d}
        {blockHeight}
        {blockMargin}
        {barMargin}
        {barHeight}
        {labelWidth}
        {valueHeight}
        {valueScale}
        {color}
        on:labelOverflow={(e) => (labelOverflows[i] = e.detail)}
      />
    {/each}
  </g>
</svg>

<style>
  .legend-box {
    display: inline-block;
    width: 1em;
    height: 1em;
    position: relative;
    top: 0.1em;
    margin-right: 0.2em;
  }
  .legend-title {
    display: inline-block;
    margin-right: 0.5em;
  }
</style>
