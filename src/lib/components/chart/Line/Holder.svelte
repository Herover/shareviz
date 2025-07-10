<script lang="ts">
  import { LabelLocation, type Root, type Line as lineType } from "$lib/chart";
  import { max, min } from "d3-array";
  import Line from "./Line.svelte";
  import { formatData } from "./data";
  import Legend from "../Legend.svelte";
  import { createDebouncer, negativeOneToInf } from "$lib/utils";
  import type { ComputedData } from "$lib/data";

  interface Props {
    chartSpec: Root;
    componentSpec: lineType;
    data: ComputedData;
    chartWidth: number;
    editor?: boolean;
    index: number;
  }

  let { chartSpec, componentSpec, data, chartWidth, editor = false, index }: Props = $props();

  let charts: ReturnType<typeof formatData> = $state([]);
  let chartDebouncer = createDebouncer(250);
  $effect(() =>
    chartDebouncer([componentSpec, data, data[componentSpec.dataSet]?.data], () => {
      charts = formatData(componentSpec, data);
      if (componentSpec.repeat) {
        charts.forEach((chart) => {
          let d2: typeof chart.d = [];
          charts.forEach((chart2) => {
            if (chart.k != chart2.k && chart2.settings?.allCharts && chart.settings?.ownChart) {
              d2 = d2.concat(chart2.d.map((dd) => ({ ...dd, isContext: true })));
            }
          });
          chart.d = d2.concat(chart.d);
        });
        charts = charts
          .filter((c) => c.settings?.ownChart)
          .sort(
            (a, b) =>
              negativeOneToInf(componentSpec.repeatSettings.byKey.findIndex((e) => e.k == a.k)) -
              negativeOneToInf(componentSpec.repeatSettings.byKey.findIndex((e) => e.k == b.k)),
          );
      }
    }),
  );

  let maxY = $derived(
    // Use the largest value across charts
    max(
      charts,
      // Use the largest value accross lines
      (d) =>
        max(
          d.d,
          // If we stack, use the visually highest point on the line, otherwise the largest value
          (dd) => max(dd.value, (ddd) => (componentSpec.stack ? ddd.to : ddd.y)) ?? 1,
        ),
    ) ?? 1,
  );
  let minY = $derived(min(charts, (d) => min(d.d, (dd) => min(dd.value, (ddd) => ddd.y))) ?? 0);
  let maxX = $derived(max(charts, (d) => max(d.d, (dd) => max(dd.value, (ddd) => ddd.x))) ?? 1);
  let minX = $derived(min(charts, (d) => min(d.d, (dd) => min(dd.value, (ddd) => ddd.x))) ?? 0);

  // let perColumn = $derived(Math.ceil(Math.sqrt(charts.length)));
  let perColumn = $derived(componentSpec.repeat != "" ? componentSpec.repeatColumns : 1);

  let legendKeys = $derived(
    componentSpec.style.byKey
      .filter(
        (s) =>
          s.label.text != "" &&
          charts.findIndex((c) => c.d.findIndex((d) => d.key == s.k) != -1) != -1,
      )
      .map((d) => ({ color: d.color, legend: d.label.text })),
  );
</script>

<!-- TODO: Should probably be a toggle setting -->
{#if componentSpec.style.byKey.length != 0 && componentSpec.style.byKey[0].label.location == LabelLocation.None}
  <Legend keys={legendKeys} />
{/if}

<div class="line-charts">
  {#each charts as chart, i}
    <div
      class="line-chart"
      style:width="{(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight) /
        perColumn}px"
    >
      <div class="line-chart-title"><span>{chart.settings?.title || chart.k}</span></div>
      <div class="line-chart-item">
        <Line
          {chartSpec}
          lineSpec={componentSpec}
          values={chart.d}
          key={charts.length == 1 ? "" : i + 1 + "."}
          width={(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight) /
            perColumn}
          {editor}
          {maxY}
          {minY}
          {maxX}
          {minX}
          {index}
          on:edit
        />
      </div>
    </div>
  {/each}
</div>

<style>
  .line-charts {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: space-between;
  }
  .line-chart {
    flex: 1 1 auto;
    word-break: break-word;
    align-items: stretch;
    display: flex;
    flex-direction: column;
  }
  .line-chart-title {
    flex: 1 1 auto;
    padding-right: 16px;
    /* font-weight: bold; */
  }
</style>
