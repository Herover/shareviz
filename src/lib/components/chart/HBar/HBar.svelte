<script lang="ts">
  import { run } from "svelte/legacy";

  import { scaleLinear } from "d3-scale";
  import { onMount } from "svelte";
  import type { Root, HBar } from "$lib/chart";
  import { AxisLocation } from "$lib/chart";
  import Axis from "../Axis.svelte";
  import HBarLine from "./HBarLine.svelte";
  import Legend from "../Legend.svelte";

  interface Props {
    labelWidth: number;
    valueWidth: number;
    values: {
      label: string;
      value: { label: string; value: number; from: number; to: number }[];
    }[];
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

  let scaleHeight = $derived(
    !showAxisLabels || hBarSpec.axis.location == AxisLocation.NONE ? 0 : 16,
  );

  let bars = $derived(
    values.length != 0 && values[0].value.length != 0 ? values[0].value.length : 0,
  );
  let barHeight = $derived(valueHeight - barMargin * 2);
  let blockHeight = $derived((hBarSpec.stackSubCategories ? 1 : bars) * valueHeight);

  let valueScale = $derived(
    scaleLinear()
      .range([0, valueWidth])
      .domain(hBarSpec.portionSubCategories ? [0, 100] : hBarSpec.scale.dataRange || [0, 1]),
  );
  // "#ff8888", "#aa2222"
  let color = $derived((d: { label: string }) => {
    const c = hBarSpec.colors.byKey.find((e) => e.k == d.label);
    if (c) {
      return c.c;
    }
    return hBarSpec.colors.default;
  });

  let height = $derived(
    (blockHeight + blockMargin) * values.length -
      blockMargin +
      // bars * barMargin +
      legendHeight +
      scaleHeight,
  );
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

  let dataSet = $derived(chartSpec.data.sets.find((set) => set.id == hBarSpec.dataSet));
</script>

{#if showLegend}
  <Legend
    keys={hBarSpec.colors.byKey
      .filter((d) => d.k != "")
      .map((d) => ({ color: d.c, legend: d.legend }))}
  />
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
      row={dataSet?.rows.find((e) => e.key == hBarSpec.value)}
    />
  </g>

  <g transform="translate({0},{hBarSpec.axis.location == AxisLocation.START ? scaleHeight : 0})">
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
