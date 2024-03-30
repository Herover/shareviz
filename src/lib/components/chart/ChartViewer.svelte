<script lang="ts">
  import type { Root } from "$lib/chart";
  import { group } from "$lib/utils";
  import HBar from "./HBar/HBar.svelte";
  import Line from "./Line/Line.svelte";

  export let chartSpec: Root;
  export let data: { [key: string]: any[] };
  export let width = 0;

  const repeatSpacing = 32;

  let sizeHeight = 0;
  $: hBarData = data[chartSpec.chart.hBar.dataSet];
  $: chartWidth = width || chartSpec.chart.width;
</script>

<div
  class="chart"
  style:width="{chartWidth}px"
  style:background-color={chartSpec.style.bgColor}
  style:padding-left="{chartSpec.style.marginLeft}px"
  style:padding-right="{chartSpec.style.marginRight}px"
  style:padding-top="{chartSpec.style.marginTop}px"
  style:padding-bottom="{chartSpec.style.marginBottom}px"
>
  <p
    style:font-size="{chartSpec.style.titleSize}px"
    style:font-weight={chartSpec.style.titleBold ? "bold" : "normal"}
    class="title"
  >
    {#each chartSpec.chart.title.split("\n") as line, i}
      {#if i != 0}
        <br />
      {/if}
      {line}
    {/each}
  </p>
  <p
    style:font-size="{chartSpec.style.subTitleSize}px"
    style:font-weight={chartSpec.style.subTitleBold ? "bold" : "normal"}
  >
    {#each chartSpec.chart.subTitle.split("\n") as line, i}
      {#if i != 0}
        <br />
      {/if}
      {line}
    {/each}
  </p>
  {#if chartSpec.chart.chartType == "hBar"}
    {#each group( chartSpec.chart.hBar.repeat, hBarData, (k, d) => ({ k, d }), ) as { k, d }, i}
      <HBar
        {chartSpec}
        hBarSpec={chartSpec.chart.hBar}
        labelWidth={chartSpec.chart.hBar.labelWidth}
        valueWidth={chartWidth -
          chartSpec.style.marginLeft -
          chartSpec.style.marginRight -
          chartSpec.chart.hBar.labelWidth}
        values={group(chartSpec.chart.hBar.categories, d, (k, g) => ({
          label: k,
          value: group(chartSpec.chart.hBar.subCategories, g, (kk, gg) => {
            let sum = gg.reduce(
              (acc, d) => acc + d[chartSpec.chart.hBar.value],
              0,
            );
            return {
              label: kk,
              value: sum,
            };
          }),
        }))}
        label={k}
        showLegend={i == 0}
      />
    {/each}
    <!-- {:else if chartSpec.chart.chartType == "line"} -->
    <Line
      {chartSpec}
      lineSpec={chartSpec.chart.line}
      values={group(
        chartSpec.chart.line.categories,
        data[chartSpec.chart.line.dataSet],
        (k, g) => ({
          label: k,
          value: g.map((d) => ({
            x: Number.parseInt(d[chartSpec.chart.line.x.key]),
            y: Number.parseInt(d[chartSpec.chart.line.y.key]),
          })),
        }),
      )}
      width={chartWidth -
        chartSpec.style.marginLeft -
        chartSpec.style.marginRight}
    />
  {/if}
  <div class="source">
    <p class="source-left">
      <a href={chartSpec.chart.sourceTextLeftLink} style="color:#888888"
        >{chartSpec.chart.sourceTextLeft}</a
      >
    </p>
    <p class="source-right">
      <a href={chartSpec.chart.sourceTextRightLink} style="color:#888888"
        >{chartSpec.chart.sourceTextRight}</a
      >
    </p>
  </div>
</div>

<style>
  .chart {
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }
  .source {
    display: flex;
    gap: 16px;
  }
  .source p {
    margin-bottom: 0px;
  }
  .source-right {
    margin-left: auto;
  }
  p.title {
    margin-top: 0px;
  }
</style>
