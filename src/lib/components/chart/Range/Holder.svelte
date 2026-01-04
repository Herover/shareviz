<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { createDebouncer, orNumber } from "$lib/utils";
  import { scaleLinear } from "d3-scale";
  import type { ChartComponentProps } from "../chartComponents";
  import { formatData } from "./data";
  import Axis from "../Axis.svelte";
  import type { RangeElement } from ".";
  import { AxisRepeatMode } from "$lib/chart";
  import { max } from "d3-array";
  import Legend from "../Legend.svelte";
  import { fontStore } from "$lib/fontStore.svelte";

  let { chartSpec, componentSpec, data, chartWidth }: ChartComponentProps<RangeElement> = $props();

  let charts: ReturnType<typeof formatData> = $state({ d: [], n: 0 });
  let chartDebouncer = createDebouncer(250);
  $effect(() =>
    chartDebouncer([componentSpec, data, data[componentSpec.dataSet]?.data], () => {
      charts = formatData(componentSpec, data);
    }),
  );

  let realWidth = $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);
  let rangeLabelWidths: { width: number }[] = $state([]);
  let rangeLabelWidths2: { width: number }[] = $state([]);
  $effect(() => {
    rangeLabelWidths2 = rangeLabelWidths.slice(0, charts.n ?? 0);
  });
  let rangeLabelSpace = $derived(max(rangeLabelWidths2, (d) => d.width) ?? 0);
  let rangeWidth = $derived(realWidth - rangeLabelSpace);

  let rangeHeight = 30;
  let topMargin = $state(1);

  let radius = 10;

  let axisOverflow: { leftOverflow?: number; rightOverflow?: number } = $state({
    leftOverflow: 0,
    rightOverflow: 0,
  });

  let xScale = $derived(
    scaleLinear()
      .domain(
        charts.d.reduce(
          (acc, e) =>
            e.d.reduce(
              (acc2, e2) =>
                e2.value.reduce(
                  (acc3, e3) => [
                    Math.min(acc3[0], orNumber(e3.v, 0)),
                    Math.max(acc3[1], orNumber(e3.v, 0)),
                  ],
                  acc2,
                ),
              acc,
            ),
          [Infinity, 0],
        ),
      )
      .range([
        Math.max(radius, axisOverflow.leftOverflow ?? 0),
        rangeWidth - Math.max(radius, axisOverflow.rightOverflow ?? 0),
      ])
      .nice(),
  );

  let _axisSpace = $derived((i: number, length: number) =>
    (componentSpec.axis.repeat == AxisRepeatMode.FIRST && i == 0) ||
    (componentSpec.axis.repeat == AxisRepeatMode.LAST && i == length - 1) ||
    componentSpec.axis.repeat == AxisRepeatMode.ALL
      ? topMargin
      : 0,
  );
</script>

<div class="range-charts">
  <Legend
    keys={componentSpec.rangeCategoryKeys.map((d) => ({
      color: d.color.light.c,
      legend: d.label.text,
    }))}
  />
  {#each charts.d as chart (chart.k)}
    <p>{chart.k}</p>
    <svg width={realWidth} height={rangeHeight * chart.d.length + topMargin}>
      <style bind:innerHTML={fontStore.fontCSS} contenteditable=""></style>
      <g transform="translate({rangeLabelSpace}, 0)">
        <Axis
          height={rangeHeight * chart.d.length + topMargin}
          width={realWidth}
          scale={xScale}
          conf={componentSpec.axis}
          dimensions={(d) => {
            if (
              axisOverflow.leftOverflow != d.leftOverflow ||
              axisOverflow.rightOverflow != d.rightOverflow
            ) {
              axisOverflow = d;
            }
            topMargin = Math.max(d.labelHeight ?? 0, 0);
          }}
          showLabels={true}
        />
      </g>

      <g transform="translate(0, {topMargin + 15})">
        {#each chart.d as line, i (chart.k + line.key)}
          <!-- <b>{line.label}</b> -->
          <text
            y={rangeHeight * i}
            dominant-baseline="middle"
            bind:contentRect={rangeLabelWidths[line.i]}>{line.label}</text
          >
          <path
            d="m {rangeLabelWidths[line.i]?.width ?? 0},{rangeHeight *
              i} L {realWidth}, {rangeHeight * i}"
            stroke-width="1"
            stroke="var(--axis-line-color)"
          />
          <g transform="translate({rangeLabelSpace}, {rangeHeight * i})">
            {#each line.value as p (chart.k + line.key + p.s?.k)}
              <circle cx={xScale(p.v)} r={radius} fill={p.s?.color.light.c ?? ""}>
                <title>{p.s?.label.text}: {p.v}</title>
              </circle>
            {/each}
          </g>
        {/each}
      </g>
    </svg>
  {/each}
</div>
