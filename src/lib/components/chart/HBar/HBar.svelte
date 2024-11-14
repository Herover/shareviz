<script lang="ts">
  import { run } from 'svelte/legacy';

  import { scaleLinear } from "d3-scale";
  import { onMount } from "svelte";
  import type { Root, HBar } from "$lib/chart";
  import { AxisLocation } from "$lib/chart";
  import Axis from "../Axis.svelte";
  import HBarLine from "./HBarLine.svelte";

  
  interface Props {
    labelWidth: number;
    valueWidth: number;
    values: {
    label: string;
    value: { label: string; value: number; from: number; to: number }[];
  }[];
    // eslint-disable-next-line svelte/valid-compile
    chartSpec: Root;
    hBarSpec: HBar;
    label: string;
    showLegend: boolean;
    showAxisLabels: boolean;
    width: number;
    labelOverflow: (overflow: number) => void;
    size?: (d: { height: number }) => void;
  }

  let {
    labelWidth,
    valueWidth,
    values,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chartSpec,
    hBarSpec,
    label,
    showLegend,
    showAxisLabels,
    width,
    labelOverflow = () => {},
    size = () => {},
  }: Props = $props();


  const valueHeight = 26;
  const barMargin = 0;
  const blockMargin = 16;
  let legendHeight = 0;

  let labelOverflows: number[] = $state([]);
  $effect(() => {
    labelOverflow(labelOverflows.slice(0, values.length).reduce((acc, n) => Math.max(acc, n), 0));
  });

  let scaleHeight =
    $derived(!showAxisLabels || hBarSpec.axis.location == AxisLocation.NONE ? 0 : 16);

  let bars =
    $derived(values.length != 0 && values[0].value.length != 0
      ? values[0].value.length
      : 0);
  let barHeight = $derived(valueHeight - barMargin * 2);
  let blockHeight = $derived((hBarSpec.stackSubCategories ? 1 : bars) * valueHeight);

  let valueScale = $derived(scaleLinear()
    .range([0, valueWidth])
    .domain(
      hBarSpec.portionSubCategories
        ? [0, 100]
        : hBarSpec.scale.dataRange || [0, 1],
    ));
  // "#ff8888", "#aa2222"
  let color = $derived((d: { label: string }) => {
    const c = hBarSpec.colors.byKey.find((e) => e.k == d.label);
    if (c) {
      return c.c;
    }
    return hBarSpec.colors.default;
  });

  let height =
    $derived((blockHeight + blockMargin) * values.length -
    blockMargin +
    // bars * barMargin +
    legendHeight +
    scaleHeight);
  onMount(() =>
    size({
      height:
        (blockHeight + blockMargin) * values.length -
        blockMargin +
        // bars * barMargin +
        legendHeight +
        scaleHeight,
    }),
  );
  run(() => {
    size({
      height:
        (blockHeight + blockMargin) * values.length -
        blockMargin +
        // bars * barMargin +
        legendHeight +
        scaleHeight,
    });
  });
</script>

{#if showLegend}
  <p>
    {#each hBarSpec.colors.byKey as d}
      {#if d.legend != "" && d.k != ""}
        <span class="legend-title"
          ><span style="background-color:{d.c}" class="legend-box"></span>
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
      height={(blockHeight + blockMargin) * values.length}
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
        labelOverflow={(n) => (labelOverflows[i] = n)}
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
