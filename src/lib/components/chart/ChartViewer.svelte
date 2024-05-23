<script lang="ts">
  import type { Root } from "$lib/chart";
  import { getComponent } from "$lib/components/chart/chartComponents";
  import { orNumber } from "$lib/utils";

  export let chartSpec: Root;
  export let data: { [key: string]: any[] };
  export let width: number | undefined = undefined;

  $: chartWidth = orNumber(width, chartSpec.chart.width);
</script>

<div
  class="chart"
  style:width="{chartWidth}px"
  style:background-color={chartSpec.style.bgColor}
  style:padding-left="{chartSpec.style.marginLeft}px"
  style:padding-right="{chartSpec.style.marginRight}px"
  style:padding-top="{chartSpec.style.marginTop}px"
  style:padding-bottom="{chartSpec.style.marginBottom}px"
  style:color="{chartSpec.style.textColor}"
  style:fill="{chartSpec.style.textColor}"
>
  <p
    style:font-size="{chartSpec.style.titleSize}em"
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
    style:font-size="{chartSpec.style.subTitleSize}em"
    style:font-weight={chartSpec.style.subTitleBold ? "bold" : "normal"}
  >
    {#each chartSpec.chart.subTitle.split("\n") as line, i}
      {#if i != 0}
        <br />
      {/if}
      {line}
    {/each}
  </p>
  {#each chartSpec.chart.elements as element}
    <svelte:component
      this={getComponent(element.type)}
      componentSpec={element.d}
      chartSpec={chartSpec}
      data={data}
      chartWidth={chartWidth}
    />
  {/each}
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
