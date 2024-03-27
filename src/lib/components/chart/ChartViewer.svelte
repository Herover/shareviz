<script lang="ts">
  import type { Root } from "$lib/chart";
  import { group } from "$lib/utils";
  import HBar from "./HBar.svelte";

  export let chartSpec: Root;
  export let data: any[];

  const repeatSpacing = 24;

  let sizeHeight = 0;
  $: sizeMul = group(chartSpec.chart.hBar.repeat, data, (k, d) => 0).length;
  const onSizeInfo = (height: number) => (sizeHeight = height);

  $: height =
    chartSpec == null
      ? 0
      : chartSpec.style.subTitleSize * 3 +
        chartSpec.style.titleSize +
        (sizeHeight + repeatSpacing) * sizeMul -
        repeatSpacing +
        16 +
        chartSpec.style.marginBottom +
        chartSpec.style.marginTop +
        chartSpec.style.sourceMargin;
</script>

<svg width={chartSpec.chart.width} {height}>
  <defs>
    <style>
      svg {
        font-family: Arial, Helvetica, sans-serif;
      }
    </style>
  </defs>
  <rect width={chartSpec.chart.width} {height} fill={chartSpec.style.bgColor} />
  <g
    transform="translate({chartSpec.style.marginLeft}, {chartSpec.style
      .marginTop})"
  >
    <text
      font-size={chartSpec.style.titleSize}
      font-weight={chartSpec.style.titleBold ? "bold" : "normal"}
      y={chartSpec.style.titleSize}>{chartSpec.chart.title}</text
    >
    <text
      font-size={chartSpec.style.subTitleSize}
      font-weight={chartSpec.style.subTitleBold ? "bold" : "normal"}
      y={chartSpec.style.subTitleSize * 2 + chartSpec.style.titleSize}
      >{chartSpec.chart.subTitle}</text
    >
    <g
      transform="translate({0},{chartSpec.style.subTitleSize * 3 +
        chartSpec.style.titleSize})"
    >
      <!-- <rect
        x={0}
        y={0}
        width={chartSpec.chart.width -
          chartSpec.style.marginLeft -
          chartSpec.style.marginRight}
        height={sizeHeight}
        fill="#aaffaa"
      /> -->
      {#if (chartSpec.chart.chartType = "hBar")}
        {#each group( chartSpec.chart.hBar.repeat, data, (k, d) => ({ k, d }), ) as { k, d }, i}
          <g transform="translate(0, {(sizeHeight + repeatSpacing) * i})">
            <HBar
              {chartSpec}
              hBarSpec={chartSpec.chart.hBar}
              labelWidth={chartSpec.chart.hBar.labelWidth}
              valueWidth={chartSpec.chart.width -
                chartSpec.style.marginLeft -
                chartSpec.style.marginRight -
                chartSpec.chart.hBar.labelWidth}
              values={group(chartSpec.chart.hBar.categories, d, (k, g) => ({
                label: k,
                value: group(
                  chartSpec.chart.hBar.subCategories,
                  g,
                  (kk, gg) => {
                    let sum = gg.reduce(
                      (acc, d) => acc + d[chartSpec.chart.hBar.value],
                      0,
                    );
                    return {
                      label: kk,
                      value: sum,
                    };
                  },
                ),
              }))}
              label={k}
              showLegend={i == 0}
              on:size={(e) => onSizeInfo(e.detail.height)}
            />
          </g>
        {/each}
      {/if}
    </g>
    <g
      transform="translate({0},{chartSpec.style.subTitleSize * 3 +
        chartSpec.style.titleSize +
        (sizeHeight + repeatSpacing) * sizeMul -
        repeatSpacing +
        chartSpec.style.sourceMargin})"
    >
      <text dominant-baseline="hanging">
        <a href={chartSpec.chart.sourceTextLeftLink} fill="#888888"
          >{chartSpec.chart.sourceTextLeft}</a
        >
      </text>
      <text
        x={chartSpec.chart.width -
          chartSpec.style.marginLeft -
          chartSpec.style.marginRight}
        dominant-baseline="hanging"
        text-anchor="end"
      >
        <a href={chartSpec.chart.sourceTextRightLink} fill="#888888"
          >{chartSpec.chart.sourceTextRight}</a
        >
      </text>
    </g>
  </g>
</svg>
