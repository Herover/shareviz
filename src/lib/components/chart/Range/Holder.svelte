<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { createDebouncer } from "$lib/utils";
  import { scaleLinear } from "d3-scale";
  import type { ChartComponentProps } from "../chartComponents";
  import { formatData } from "./data";
  import Axis from "../Axis.svelte";
  import type { RangeElement } from ".";
  import { AxisRepeatMode } from "$lib/chart";

  let { chartSpec, componentSpec, data, chartWidth }: ChartComponentProps<RangeElement> = $props();

  let realWidth = $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);

  let height = 30;
  let topMargin = $state(1);

  let radius = 10;

  let axisOverflow: { leftOverflow?: number; rightOverflow?: number } = $state({
    leftOverflow: 0,
    rightOverflow: 0,
  });

  let charts: ReturnType<typeof formatData> = $state([]);
  let chartDebouncer = createDebouncer(250);
  $effect(() =>
    chartDebouncer([componentSpec, data, data[componentSpec.dataSet]?.data], () => {
      charts = formatData(componentSpec, data);
    }),
  );

  let xScale = $derived(
    scaleLinear()
      .domain(
        charts.reduce(
          (acc, e) =>
            e.d.reduce(
              (acc2, e2) =>
                e2.value.reduce(
                  (acc3, e3) => [Math.min(acc3[0], e3.v), Math.max(acc3[1], e3.v)],
                  acc2,
                ),
              acc,
            ),
          [Infinity, 0],
        ),
      )
      .range([Math.max(radius, axisOverflow.leftOverflow ?? 0), realWidth - 0])
      .nice(),
  );

  let axisSpace = $derived((i: number, length: number) =>
    (componentSpec.axis.repeat == AxisRepeatMode.FIRST && i == 0) ||
    (componentSpec.axis.repeat == AxisRepeatMode.LAST && i == length - 1) ||
    componentSpec.axis.repeat == AxisRepeatMode.ALL
      ? topMargin
      : 0,
  );
</script>

<div class="range-charts">
  {#each charts as chart (chart.k)}
    {#each chart.d as line, i (chart.k + line.key)}
      <b>{line.label}</b>
      <svg width={realWidth} height={height + axisSpace(i, chart.d.length)}>
        <Axis
          height={60}
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
          showLabels={axisSpace(i, chart.d.length) != 0}
        />

        <g transform="translate(0, {15 + axisSpace(i, chart.d.length)})">
          {#each line.value as p (chart.k + line.key + p.v)}
            <circle cx={xScale(p.v)} r={radius} fill={p.s?.color ?? ""}>
              <title>{p.s?.label.text}: {p.v}</title>
            </circle>
          {/each}
        </g>
      </svg>
    {/each}
  {/each}
</div>
