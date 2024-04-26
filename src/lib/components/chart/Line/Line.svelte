<script lang="ts">
  import { AxisLocation, AxisOrientation, type Line, type Root } from "$lib/chart";
  import { formatNumber, group } from "$lib/utils";
  import { scaleLinear } from "d3-scale";
  import { line } from "d3-shape";
  import Axis, {
  } from "../Axis.svelte";

  export let values: {
    label: string;
    value: { x: number; y: number }[];
  }[];
  export let chartSpec: Root;
  export let lineSpec: Line;
  export let width: number;

  const height = 300;
  const labelWidth = 80;
  const topMargin = 24;
  const bottomMargin = 24;
  const leftMargin = 24;
  const rightMargin = 0;
  const lineWidth = 3;
  const lineColor = "#000000";
  const fillColor = "rgba(255, 0, 0, 0.3)";

  const yAxisConf = {
    location: AxisLocation.END,
    labelSpace: 64,
    orientation: AxisOrientation.HORIZONTAL,
    major: {
      grid: true,
      enabled: true,
      tickSize: 8,
      color: "#aaaaaa",
      labelDivide: 1000000,
      labelThousands: ",",
      afterLabel: " mio.",
      auto: {
        from: 0,
        each: 5000000,
        labels: true,
      },
      ticks: [],
    },
    minor: {
      grid: false,
      enabled: false,
      tickSize: 8,
      color: "#aaaaaa",
      labelDivide: 1,
      labelThousands: "",
      afterLabel: " mio.",
      auto: {
        from: 0,
        each: 1000000,
        labels: false,
      },
      ticks: [],
    },
  };
  const xAxisConf = {
    location: AxisLocation.END,
    labelSpace: 64,
    orientation: AxisOrientation.VERTICAL,
    major: {
      grid: false,
      enabled: true,
      tickSize: 8,
      color: "#aaaaaa",
      labelDivide: 1,
      labelThousands: "",
      afterLabel: "",
      auto: {
        from: 2010,
        each: 5,
        labels: true,
      },
      ticks: [],
    },
    minor: {
      grid: false,
      enabled: true,
      tickSize: 4,
      color: "#aaaaaa",
      labelDivide: 1,
      labelThousands: "",
      afterLabel: "",
      auto: {
        from: 2010,
        each: 1,
        labels: false,
      },
      ticks: [],
    },
  };

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

  $: xScale = scaleLinear()
    .range([leftMargin, width - labelWidth - rightMargin])
    .domain(
      chartSpec.chart.scales.find((s) => s.name == lineSpec.x.scale)
        ?.dataRange ||
        console.warn("x scale not found") || [0, 1],
    );
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
    <Axis {height} {width} scale={yScale} conf={yAxisConf} />
    <Axis
      height={height - topMargin - bottomMargin}
      {width}
      scale={xScale}
      conf={xAxisConf}
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
