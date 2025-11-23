<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { createDebouncer } from "$lib/utils";
    import { scaleLinear } from "d3-scale";
  import type { ChartComponentProps } from "../chartComponents";
  import { formatData } from "./data";

  let { chartSpec, componentSpec, data, chartWidth, editor = false, index }: ChartComponentProps = $props();

  let realWidth = $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);
  let radius = 10;

  let charts: ReturnType<typeof formatData> = $state([]);
  let chartDebouncer = createDebouncer(250);
  $effect(() =>
    chartDebouncer([componentSpec, data, data[componentSpec.dataSet]?.data], () => {
      charts = formatData(componentSpec, data);
    })
  );

  $inspect(charts)

  let xScale = $derived(
    scaleLinear()
      .domain(charts.reduce((acc, e) => e.d.reduce((acc2, e2) => e2.value.reduce((acc3, e3) => [Math.min(acc3[0], e3.v), Math.max(acc3[1], e3.v)], acc2), acc), [0, 0]))
      .range([radius, realWidth - radius])
  )
  $inspect(xScale.range(), xScale.domain())
</script>

<div class="range-charts">
  {#each charts as chart}
    {#each chart.d as line}
      <svg width={realWidth} height={30}>
        <g transform="translate(0, {15})">
          {#each line.value as p}
            <circle cx={xScale(p.v)} r={radius} fill="black">
              <title>{p.l}</title>
            </circle>
          {/each}
        </g>
      </svg>
    {/each}
  {/each}
</div>
