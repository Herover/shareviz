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
  // let perColumn = $derived(Math.ceil(Math.sqrt(charts.length)));
  let perColumn = $derived(componentSpec.repeat != "" ? componentSpec.repeatColumns : 1);
</script>

<div class="line-charts">
  {#each charts as chart, i}
    <div
      class="line-chart"
      style:width="{(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight) / perColumn}px"
    >
      <div class="line-chart-title"><span>{chart.k}</span></div>
      <div class="line-chart-item">
        <Line
          {chartSpec}
          lineSpec={componentSpec}
          values={chart.d}
          key={charts.length == 1 ? "" : i + 1 + "."}
          width={(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight) / perColumn}
          {editor}
          {maxY}
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
