<script lang="ts">
  import type { Root } from "$lib/chart";
  import HBar from "./HBar.svelte";

  export let chartSpec: Root;
  export let data: any[];

  let sizeHeight = 0;
  const onSizeInfo = (height: number) => (sizeHeight = height);

  const group = <T extends any, U>(
    key: string,
    d: T[],
    f: (key: string, group: T[]) => U,
  ): U[] => {
    const groups = d.reduce(
      (acc, line: any) => {
        if (acc[line[key]]) {
          acc[line[key]].push(line);
        } else {
          acc[line[key]] = [line];
        }
        return acc;
      },
      {} as { [key: string]: T[] },
    );

    return Object.keys(groups).map((k) => f(k, groups[k]));
  };

  $: height =
    chartSpec == null
      ? 0
      : chartSpec.style.subTitleSize * 3 +
        chartSpec.style.titleSize +
        sizeHeight +
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
        <HBar
          labelWidth={chartSpec.chart.hBar.labelWidth}
          valueWidth={chartSpec.chart.width -
            chartSpec.style.marginLeft -
            chartSpec.style.marginRight -
            chartSpec.chart.hBar.labelWidth}
          values={group(chartSpec.chart.hBar.categories, data, (k, g) => ({
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
          on:size={(e) => onSizeInfo(e.detail.height)}
        />
      {/if}
    </g>
    <g
      transform="translate({0},{chartSpec.style.subTitleSize * 3 +
        chartSpec.style.titleSize +
        sizeHeight +
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
