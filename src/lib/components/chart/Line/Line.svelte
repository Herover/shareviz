<script lang="ts">
  import { type Line, type Root } from "$lib/chart";
  import { group, valueKinds, valueParsers } from "$lib/utils";
  import { scaleLinear, scaleTime, type ScaleLinear, type ScaleTime } from "d3-scale";
  import { line } from "d3-shape";
  import Axis from "../Axis.svelte";
    import { max, min } from "d3-array";

  export let values: {
    label: string;
    value: { x: number; y: number }[];
  }[];
  export let chartSpec: Root;
  export let lineSpec: Line;
  export let width: number;
  $: console.log("values", values);
  const height = 300;
  const labelWidth = 80;
  const topMargin = 24;
  const bottomMargin = 24;
  const leftMargin = 24;
  const rightMargin = 0;
  const lineWidth = 3;
  const lineColor = "#000000";
  const fillColor = "rgba(255, 0, 0, 0.3)";

  $: stacked = values
    .sort((a, b) => a.value[0].y - b.value[0].y)
    .reduce(
      (acc, line, i) => {
        const lastLine =
          lineSpec.stack && i != 0
            ? acc[i - 1].value.map((d) => d.to)
            : line.value.map((d) => 0);
        acc.push({
          label: line.label,
          value: group("x", line.value, (k, d) => ({ k, d })).map((d, i) => {
            // Sum values if this line has multiple of the same X value, ex.
            // same year multiple times.
            const summed = d.d.reduce((acc, dd) => acc + dd.y, 0);
            return {
              x: d.d[0].x,
              y: summed,
              to: summed + lastLine[i],
              from: lastLine[i],
            };
          }),
        });
        return acc;
      },
      [] as {
        label: string;
        value: { x: number; y: number; to: number; from: number }[];
      }[],
    );

  $: minX = min(values, d => min(d.value, dd => dd.x)) || 0;
  $: maxX = max(values, d => max(d.value, dd => dd.x)) || 1;
  $: xScaleSpec = chartSpec.chart.scales.find(
    (s) => s.name == lineSpec.x.scale,
  );
  $: xType =
    valueParsers[
      chartSpec.data.sets
        .find((set) => set.id == lineSpec.dataSet)
        ?.rows.find((r) => r.key == xScaleSpec?.dataKey)?.type || ""
    ]?.type || "";
  let xScale: ScaleLinear<number, number, never> | ScaleTime<number, number, never> = scaleLinear();
  $: {
    if (xType == valueKinds.NUMBER) {
      xScale = scaleLinear()
        .range([leftMargin, width - labelWidth - rightMargin])
        .domain([minX, maxX]);
    } else if (xType == valueKinds.DATE) {
      xScale = scaleTime()
        .range([leftMargin, width - labelWidth - rightMargin])
        .domain([minX, maxX]);
    }
  }
  $: yScale = scaleLinear()
    .range([height - topMargin - bottomMargin, 0])
    .domain(
      chartSpec.chart.scales.find((s) => s.name == lineSpec.y.scale)
        ?.dataRange ||
        console.warn("y scale not found") || [0, 1],
    );

  $: draw = line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  $: console.log("line", stacked, yScale.domain());
</script>

<svg {width} {height}>
  <g transform="translate(0, {topMargin})">
    <Axis {height} {width} scale={yScale} conf={lineSpec.y.axis} />
    <Axis
      height={height - topMargin - bottomMargin}
      {width}
      scale={xScale}
      conf={lineSpec.x.axis}
    />
    {#if lineSpec.stack}
      {#each stacked as d, i}
        <path
          d={draw(
            d.value
              .map((e) => ({ x: e.x, y: e.to }))
              .concat(
                (
                  stacked[i - 1]?.value || [
                    { x: xScale.domain()[0], to: 0 },
                    { x: xScale.domain()[1], to: 0 },
                  ]
                )
                  .map((e) => ({ x: e.x, y: e.to }))
                  .reverse(),
              ),
          )}
          fill={fillColor}
        />
      {/each}
      {#each stacked as d, i}
        <path
          d={draw(d.value.map((e) => ({ x: e.x, y: e.to })))}
          stroke={lineColor}
          stroke-width={lineWidth}
          fill="none"
        />
      {/each}
    {:else}
      {#if lineSpec.fill}
        {#each stacked as d}
          <path
            d={draw(
              d.value.concat([
                { ...d.value[d.value.length - 1], y: 0 },
                { ...d.value[0], y: 0 },
              ]),
            )}
            fill={fillColor}
          />
        {/each}
      {/if}
      {#each stacked as d}
        <path
          d={draw(d.value)}
          stroke={lineColor}
          stroke-width={lineWidth}
          fill="none"
        />
      {/each}
    {/if}
  </g>
</svg>

<style>
  path {
    stroke-linejoin: round;
  }
</style>
