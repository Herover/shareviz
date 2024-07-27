<script lang="ts">
  import { AxisLocation, LabelLocation, type Line, type Root } from "$lib/chart";
  import { group, orDefault, orNumber, valueKinds, valueParsers } from "$lib/utils";
  import {
    scaleLinear,
    scaleTime,
    type ScaleLinear,
    type ScaleTime,
  } from "d3-scale";
  import { line } from "d3-shape";
  import Axis from "../Axis.svelte";
  import { max, min } from "d3-array";
  import FloatingLabels from "./FloatingLabels.svelte";
  import { createEventDispatcher } from "svelte";

  export let values: {
    label: string;
    key: string;
    value: { x: number; y: number }[];
  }[];
  export let chartSpec: Root;
  export let lineSpec: Line;
  export let width: number;
  export let editor = false;

  const dispatch = createEventDispatcher<{
    edit: any[];
  }>();

  let labelBox: DOMRect | undefined;
  const topMargin = 24;
  const bottomMargin = 24;
  const labelOffset = 16;

  $: dataSet = chartSpec.data.sets.find((set) => set.id == lineSpec.dataSet);

  let xAxisOverflow: { leftOverflow?: number, rightOverflow?: number } = { leftOverflow: 0, rightOverflow: 0 };
  let yAxisWidth = 0;
  $: labelWidth = labelBox ? labelBox.width + labelOffset : 0;
  let leftMargin = 0;
  let rightMargin = 0;
  $: {
    if (lineSpec.y.axis.location == AxisLocation.START && lineSpec.style.default.label.location == LabelLocation.Left) {
      leftMargin = Math.max(Math.max(yAxisWidth, labelWidth), orNumber(xAxisOverflow.leftOverflow, 0));
      rightMargin = orDefault(xAxisOverflow.rightOverflow, 0);
    } else if (lineSpec.y.axis.location == AxisLocation.START && lineSpec.style.default.label.location == LabelLocation.Right) {
      leftMargin = Math.max(yAxisWidth, orNumber(xAxisOverflow.leftOverflow, 0));
      rightMargin = Math.max(labelWidth, orDefault(xAxisOverflow.rightOverflow, 0));
    } else if (lineSpec.y.axis.location == AxisLocation.END && lineSpec.style.default.label.location == LabelLocation.Left) {
      leftMargin = Math.max(labelWidth, orNumber(xAxisOverflow.leftOverflow, 0));
      rightMargin = Math.max(yAxisWidth, orDefault(xAxisOverflow.rightOverflow, 0));
    } else {
      leftMargin = orNumber(xAxisOverflow.leftOverflow, 0);
      rightMargin = Math.max(Math.max(yAxisWidth, labelWidth), orDefault(xAxisOverflow.rightOverflow, 0));
    }
  }


  $: height = width * lineSpec.heightRatio;

  const negativeOneToInf = (n: number) =>
    n == -1 ? Number.POSITIVE_INFINITY : n;

  $: stacked = values
    .sort(
      (a, b) =>
        negativeOneToInf(lineSpec.style.byKey.findIndex((e) => e.k == b.key)) -
        negativeOneToInf(lineSpec.style.byKey.findIndex((e) => e.k == a.key)),
    )
    .reduce(
      (acc, line, i) => {
        const lastLine =
          lineSpec.stack && i != 0
            ? acc[i - 1].value.map((d) => d.to)
            : line.value.map(() => 0);
        acc.push({
          label: line.label,
          key: line.key,
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
        key: string;
        value: { x: number; y: number; to: number; from: number }[];
      }[],
    );

  $: columns = [
    ...orDefault(dataSet?.rows, []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toKey, type: e.type })), []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toValue, type: e.type })), []),
  ];

  $: minX = orNumber(min(values, (d) => min(d.value, (dd) => dd.x)));
  $: maxX = orNumber(max(values, (d) => max(d.value, (dd) => dd.x)), 1);
  $: xType =
    orDefault(valueParsers[
      orDefault(columns.find((r) => r.key == lineSpec.x.key)?.type, "")
    ]?.type, "" as valueKinds);
  let xScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never> = scaleLinear();
  $: {
    if (xType == valueKinds.NUMBER) {
      xScale = scaleLinear()
        .range([leftMargin, width - rightMargin])
        .domain([minX, maxX]);
    } else if (xType == valueKinds.DATE) {
      xScale = scaleTime()
        .range([leftMargin, width - rightMargin])
        .domain([minX, maxX]);
    }
  }
  $: maxY = orNumber(max(stacked, (d) => max(d.value, (dd) => dd.to)), 1);
  $: yScale = scaleLinear()
    .range([height - topMargin - bottomMargin, 0])
    .domain(
      [0, maxY],
      // chartSpec.chart.scales.find((s) => s.name == lineSpec.y.scale)
      //   ?.dataRange || [0, 1],
    )
    .nice();

  $: draw = line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  $: getStyle = (k: string) => {
    const style = lineSpec.style.byKey.find((s) => s.k == k);
    if (style) return style;
    else {
      const def = {
        ...lineSpec.style.default,
      };
      def.label.text = def.label.text == "" ? "" : k;

      return def;
    }
  };
</script>

<svg {width} {height}>
  <g transform="translate(0, {topMargin})">
    <Axis {height} {width} scale={yScale} conf={lineSpec.y.axis} on:dimensions={e => yAxisWidth = e.detail.width} />
    <Axis
      height={height - topMargin - bottomMargin}
      {width}
      scale={xScale}
      conf={lineSpec.x.axis}
      on:dimensions={e => xAxisOverflow = e.detail}
    />
    {#if lineSpec.stack}
      {#each stacked as d, i}
        <path
          d={draw(
            d.value
              .map((e) => ({ x: e.x, y: e.to }))
              .concat(
                (
                  orDefault(
                    stacked[i - 1]?.value,
                    [
                      { x: xScale.domain()[0], to: 0 },
                      { x: xScale.domain()[1], to: 0 },
                    ]
                  )
                )
                  .map((e) => ({ x: e.x, y: e.to }))
                  .reverse(),
              ),
          )}
          fill={getStyle(d.key).color}
        />
      {/each}
      {#each stacked as d}
        <path
          d={draw(d.value.map((e) => ({ x: e.x, y: e.to })))}
          stroke={getStyle(d.key).color}
          stroke-width={getStyle(d.key).width}
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
            fill={getStyle(d.key).color}
          />
        {/each}
      {/if}
      {#each stacked as d}
        <path
          d={draw(d.value)}
          stroke={getStyle(d.key).color}
          stroke-width={getStyle(d.key).width}
          fill="none"
        />
      {/each}
    {/if}

    <g bind:contentRect={labelBox}>
      {#each stacked as d}
        {#if getStyle(d.key).label.location == LabelLocation.Right}
          <text
            x={xScale(d.value[d.value.length - 1].x) + labelOffset}
            y={yScale(d.value[d.value.length - 1].to)}
            d={draw(d.value)}
            fill={getStyle(d.key).label.color}
            paint-order="stroke"
            stroke="{chartSpec.style.bgColor}"
            stroke-width={3}
            dominant-baseline="middle"
            text-anchor="start">{getStyle(d.key).label.text}</text
          >
        {:else if getStyle(d.key).label.location == LabelLocation.Left}
          <text
            x={xScale(d.value[0].x) - labelOffset}
            y={yScale(d.value[0].to)}
            d={draw(d.value)}
            fill={getStyle(d.key).label.color}
            paint-order="stroke"
            stroke="{chartSpec.style.bgColor}"
            stroke-width={3}
            dominant-baseline="middle"
            text-anchor="end">{getStyle(d.key).label.text}</text
          >
        {/if}
      {/each}
    </g>
    <FloatingLabels
      lines={lineSpec.style.byKey.filter(e => e.label.location == LabelLocation.Float)}
      xScale={xScale}
      yScale={yScale}
      {editor}
      on:edit={e => dispatch("edit", ["style", ...e.detail])}
    />
  </g>
</svg>

<style>
  path {
    stroke-linejoin: round;
  }
</style>
