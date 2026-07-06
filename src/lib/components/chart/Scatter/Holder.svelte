<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { max, min } from "d3-array";
  import { createDebouncer } from "$lib/utils";
  import type { ChartComponentProps } from "../chartComponents";
  import type { ScatterElement } from ".";
  import { formatData } from "./data";
  import Legend from "../Legend.svelte";
  import Scatter from "./Scatter.svelte";
  import { createEventDispatcher } from "svelte";

  let {
    chartSpec,
    componentSpec,
    data,
    chartWidth,
    editor = false,
  }: ChartComponentProps<ScatterElement> = $props();

  const dispatch = createEventDispatcher<{
    edit: any[];
  }>();

  let charts: ReturnType<typeof formatData> = $state([]);
  let chartDebouncer = createDebouncer(250);
  $effect(() =>
    chartDebouncer([componentSpec, data, data[componentSpec.dataSet]?.data], () => {
      charts = formatData(componentSpec, data);
    }),
  );

  let dataSet = $derived(chartSpec.data.sets.find((set) => set.id == componentSpec.dataSet));

  let repeat = $derived(componentSpec.repeat ?? "");
  let visibleCharts = $derived(
    repeat == "" ? charts : charts.filter((c) => c.settings?.ownChart ?? true),
  );
  // Series from other charts marked "show on all charts", drawn muted
  let contextSeriesFor = $derived((chartKey: string) =>
    repeat == ""
      ? []
      : charts
          .filter((c) => c.k != chartKey && (c.settings?.allCharts ?? false))
          .flatMap((c) => c.series),
  );

  let width = $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);
  let perColumn = $derived(repeat != "" ? (componentSpec.repeatColumns ?? 2) : 1);

  // Shared across all charts so the small multiples stay comparable
  let allSeries = $derived(charts.flatMap((c) => c.series));
  let minX = $derived(min(allSeries, (s) => min(s.points, (p) => p.x)) ?? 0);
  let maxX = $derived(max(allSeries, (s) => max(s.points, (p) => p.x)) ?? 1);
  let minY = $derived(min(allSeries, (s) => min(s.points, (p) => p.y)) ?? 0);
  let maxY = $derived(max(allSeries, (s) => max(s.points, (p) => p.y)) ?? 1);
  let maxRValue = $derived(max(allSeries, (s) => max(s.points, (p) => p.r ?? 0)) ?? 0);
</script>

{#if componentSpec.categories != ""}
  <Legend
    keys={componentSpec.categoryKeys.map((d) => ({
      color: d.color.light.c,
      legend: d.label.text,
    }))}
  />
{/if}

<div class="scatter-charts">
  {#each visibleCharts as chart (chart.k)}
    <div class="scatter-chart" style:width="{width / perColumn}px">
      {#if repeat != ""}
        <div class="scatter-chart-title"><span>{chart.settings?.title || chart.k}</span></div>
      {/if}
      <Scatter
        {chartSpec}
        {componentSpec}
        series={chart.series}
        contextSeries={contextSeriesFor(chart.k)}
        width={width / perColumn}
        {editor}
        {minX}
        {maxX}
        {minY}
        {maxY}
        {maxRValue}
        {dataSet}
        onedit={(d) => dispatch("edit", d)}
      />
    </div>
  {/each}
</div>

<style>
  .scatter-charts {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: space-between;
  }
  .scatter-chart {
    flex: 0 1 auto;
    word-break: break-word;
    display: flex;
    flex-direction: column;
  }
  .scatter-chart-title {
    padding-right: 16px;
  }
</style>
