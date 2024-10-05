<script lang="ts">
  import { AxisLocation, LabelLocation, LineSymbol, type Line, type Root } from "$lib/chart";
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
  import FloatingLabels from "./FloatingLabels/FloatingLabels.svelte";
  import { createEventDispatcher } from "svelte";
  import { chartToEditor } from "$lib/chartToEditorStore";

  export let values: {
    label: string;
    key: string;
    value: { x: number; y: number }[];
  }[];
  export let chartSpec: Root;
  export let lineSpec: Line;
  export let width: number;
  export let editor = false;
  export let index: number;

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

  // I'd prefer that each element in stacked is a array of line segments for a
  // country. However, this is easier to compute and handle in template.
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

        const values = group("x", line.value, (k, d) => ({ k, d }))
          .map((d, i) => {
            // Sum values if this line has multiple of the same X value, ex.
            // same year multiple times.
            const summed = d.d.reduce((acc, dd) => acc + dd.y, 0);
            return {
              x: d.d[0].x,
              y: summed,
              to: summed + lastLine[i],
              from: lastLine[i],
            };
          })
          // Split line parts into multiple if there's a NaN value
          .reduce((acc, value, i, arr) => {
            if (Number.isNaN(value.y)) {
              if (i != arr.length - 1 && !Number.isNaN(arr[i + 1].y)) {
                acc.push([]);
              }
            } else {
              acc[acc.length - 1].push(value);
            }

            return acc;
          }, [[]] as { x: number; y: number; to: number; from: number }[][]);

        values.filter(d => d.length != 0)
          .forEach((value, i, arr) => {
            acc.push({
              label: line.label,
              key: line.key,
              type: "line",
              value,
            });
            if (i != arr.length - 1) {
              acc.push({
                label: line.label,
                key: line.key,
                type: "missing",
                value: [
                  { ...value[value.length - 1] },
                  { ...arr[i + 1][0] },
                ],
              });
            }
          });
        return acc;
      },
      [] as {
        label: string;
        key: string;
        type: "missing" | "line";
        value: { x: number; y: number; to: number; from: number }[];
      }[],
    );
  $: columns = [
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toKey, type: e.keyType })), []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toValue, type: e.valueType })), []),
    ...orDefault(dataSet?.rows, []),
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
        .domain([minX, maxX])
        .nice();
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

  $: higlight = $chartToEditor.highlight[0] == "elements"
    && $chartToEditor.highlight[1] == index
    ? $chartToEditor.highlight[2] as string
    : null;
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
          stroke-width={higlight === d.key ? getStyle(d.key).width + 2 : getStyle(d.key).width}
          fill="none"
          stroke-dasharray={d.type == "line" ? null : "3"}
        />
      {/each}
    {/if}

    <g bind:contentRect={labelBox}>
      {#each stacked as d, i}
        {#if getStyle(d.key).label.location == LabelLocation.Right}
          {#if stacked.length == i + 1 || stacked[i + 1].key !== d.key}
            <text
              x={xScale(d.value[d.value.length - 1].x) + labelOffset}
              y={yScale(d.value[d.value.length - 1].to)}
              fill={getStyle(d.key).label.color}
              paint-order="stroke"
              stroke="{chartSpec.style.bgColor}"
              stroke-width={3}
              dominant-baseline="middle"
              text-anchor="start">{getStyle(d.key).label.text}</text
            >
          {/if}
        {:else if getStyle(d.key).label.location == LabelLocation.Left}
          {#if i == 0 || stacked[i - 1].key !== d.key}
            <text
              x={xScale(d.value[0].x) - labelOffset}
              y={yScale(d.value[0].to)}
              fill={getStyle(d.key).label.color}
              paint-order="stroke"
              stroke="{chartSpec.style.bgColor}"
              stroke-width={3}
              dominant-baseline="middle"
              text-anchor="end">{getStyle(d.key).label.text}</text
            >
          {/if}
        {/if}
      {/each}
    </g>
    {#each stacked as d, i}
      {#if getStyle(d.key).symbols == LineSymbol.CIRCLE}
        {#each d.value as value}
          <circle
            cx={xScale(value.x)}
            cy={yScale(value.y)}
            fill={getStyle(d.key).label.color}
            r={getStyle(d.key).width * 2}
          />
        {/each}
      {/if}
    {/each}
    <FloatingLabels
      lines={lineSpec.style.byKey}
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
