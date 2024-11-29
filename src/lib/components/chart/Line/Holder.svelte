<script lang="ts">
  import type { Root, Line as lineType } from "$lib/chart";
    import { max } from "d3-array";
  import Line from "./Line.svelte";
  import { formatData } from "./data";

  interface Props {
    chartSpec: Root;
    componentSpec: lineType;
    data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any[];
  };
    chartWidth: number;
    editor?: boolean;
    index: number;
  }

  let {
    chartSpec,
    componentSpec,
    data,
    chartWidth,
    editor = false,
    index
  }: Props = $props();

  let charts = $derived(formatData(componentSpec, data));
  let maxY = $derived(max(charts, d => max(d.d, dd => max(dd.value, ddd => ddd.y))) ?? 1);
</script>

{#each charts as chart}
  <Line
    {chartSpec}
    lineSpec={componentSpec}
    values={chart.d}
    key={chart.k}
    width={(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight)/ charts.length}
    {editor}
    {maxY}
    {index}
    on:edit
  />
{/each}
