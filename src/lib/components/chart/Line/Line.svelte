<script lang="ts">
  import { run } from "svelte/legacy";

  import {
    AxisLocation,
    LabelLocation,
    LineMissingStyle,
    LineSymbol,
    type Line,
    type Root,
  } from "$lib/chart";
  import { orDefault, orNumber, valueKinds, valueParsers } from "$lib/utils";
  import { scaleLinear, scaleTime, type ScaleLinear, type ScaleTime } from "d3-scale";
  import { line } from "d3-shape";
  import Axis from "../Axis.svelte";
  import FloatingLabels from "./FloatingLabels/FloatingLabels.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import { chartToEditor } from "$lib/chartToEditorStore";

  interface Props {
    values: {
      label: string;
      key: string;
      type: "missing" | "line";
      isContext?: boolean;
      value: {
        x: number | Date;
        y: number;
        to: number;
        from: number;
      }[];
    }[];
    key: string;
    chartSpec: Root;
    lineSpec: Line;
    width: number;
    editor?: boolean;
    maxY: number;
    minY: number;
    maxX: number | Date;
    minX: number | Date;
    index: number;
  }

  let {
    values,
    chartSpec,
    lineSpec,
    width,
    editor = false,
    maxY,
    minY,
    maxX,
    minX,
    index,
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    edit: any[];
  }>();

  let labelBox: DOMRect | undefined = $state();
  let topMargin = $state(0);
  let bottomMargin = $state(0);
  const labelOffset = 16;
  // $inspect(topMargin, bottomMargin).with(console.log)
  let t1 = Date.now();
  onMount(() => console.log("mounted!", Date.now() - t1));

  let dataSet = $derived(chartSpec.data.sets.find((set) => set.id == lineSpec.dataSet));

  let xAxisOverflow: { leftOverflow?: number; rightOverflow?: number } = $state({
    leftOverflow: 0,
    rightOverflow: 0,
  });
  // $effect(() => console.log($state.snapshot(xAxisOverflow)))
  let yAxisWidth = $state(0);
  let labelWidth = $derived(labelBox && labelBox.width != 0 ? labelBox.width + labelOffset : 0);
  let leftMargin = $state(0);
  let rightMargin = $state(0);
  let margin = 8; //$derived(lineSpec.y.axis.labelSpace)
  $effect(() => {
    if (
      lineSpec.y.axis.location == AxisLocation.START &&
      lineSpec.style.default.label.location == LabelLocation.Left
    ) {
      leftMargin =
        Math.max(Math.max(yAxisWidth, labelWidth), orNumber(xAxisOverflow.leftOverflow, 0)) +
        margin;
      rightMargin = orDefault(xAxisOverflow.rightOverflow, 0) + margin;
    } else if (
      lineSpec.y.axis.location == AxisLocation.START &&
      lineSpec.style.default.label.location == LabelLocation.Right
    ) {
      leftMargin = Math.max(yAxisWidth, orNumber(xAxisOverflow.leftOverflow, 0)) + margin;
      rightMargin = Math.max(labelWidth, orDefault(xAxisOverflow.rightOverflow, 0)) + margin;
    } else if (
      lineSpec.y.axis.location == AxisLocation.END &&
      lineSpec.style.default.label.location == LabelLocation.Left
    ) {
      leftMargin = Math.max(labelWidth, orNumber(xAxisOverflow.leftOverflow, 0)) + margin;
      rightMargin = Math.max(yAxisWidth, orDefault(xAxisOverflow.rightOverflow, 0)) + margin;
    } else if (
      lineSpec.y.axis.location == AxisLocation.END &&
      lineSpec.style.default.label.location == LabelLocation.Right
    ) {
      leftMargin = orNumber(xAxisOverflow.leftOverflow, 0) + margin;
      rightMargin =
        Math.max(Math.max(yAxisWidth, labelWidth), orDefault(xAxisOverflow.rightOverflow, 0)) +
        margin;
    }
  });

  let height = $derived(width * lineSpec.heightRatio);

  let columns = $derived([
    ...orDefault(
      dataSet?.transpose?.map((e) => ({ key: e.toKey, type: e.keyType })),
      [],
    ),
    ...orDefault(
      dataSet?.transpose?.map((e) => ({ key: e.toValue, type: e.valueType })),
      [],
    ),
    ...orDefault(dataSet?.rows, []),
  ]);

  let xType = $derived(
    orDefault(
      valueParsers[orDefault(columns.find((r) => r.key == lineSpec.x.key)?.type, "")]?.type,
      "" as valueKinds,
    ),
  );
  let xScale: ScaleLinear<number, number, never> | ScaleTime<number, number, never> =
    $state(scaleLinear());
  run(() => {
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
  });
  // let maxY = $derived(orNumber(max(stacked, (d) => max(d.value, (dd) => dd.to)), 1));
  let yScale = $derived(
    scaleLinear()
      .range([height, 0])
      .domain(
        [Math.min(0, minY), Math.max(0, maxY)],
        // chartSpec.chart.scales.find((s) => s.name == lineSpec.y.scale)
        //   ?.dataRange || [0, 1],
      ),
  );

  let draw = $derived(
    line<{ x: number | Date; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y)),
  );

  let getStyle = $derived((k: string) => {
    const style = lineSpec.style.byKey.find((s) => s.k == k);
    if (style) return style;
    else {
      const def = {
        ...lineSpec.style.default,
        label: { ...lineSpec.style.default.label },
      };
      def.label.text = def.label.text == "" ? "" : k;

      return def;
    }
  });

  let higlight = $derived(
    $chartToEditor.highlight[0] == "elements" && $chartToEditor.highlight[1] == index
      ? ($chartToEditor.highlight[2] as string)
      : null,
  );
</script>

<svg {width} height={height + topMargin + bottomMargin + lineSpec.x.axis.major.tickWidth * 2}>
  <g transform="translate(0, {topMargin})">
    <Axis
      {height}
      {width}
      scale={yScale}
      conf={lineSpec.y.axis}
      dimensions={(d) => {
        yAxisWidth = d.width;
        topMargin = Math.max(-(d.topPos ?? 0), 0);
      }}
    />
    <Axis
      {height}
      {width}
      scale={xScale}
      conf={lineSpec.x.axis}
      dimensions={(d) => {
        xAxisOverflow = d;
        bottomMargin = d.labelHeight;
      }}
    />
    {#if lineSpec.stack}
      {#each values as d, i}
        <path
          d={draw(
            d.value
              .map((e) => ({ x: e.x, y: e.to }))
              .concat(
                orDefault(values[i - 1]?.value, [
                  { x: xScale.domain()[0], to: 0, y: 0, from: 0 },
                  { x: xScale.domain()[1], to: 0, y: 0, from: 0 },
                ])
                  .map((e) => ({ x: e.x, y: e.to }))
                  .reverse(),
              ),
          )}
          fill={d.isContext ? getStyle(d.key).contextColor : getStyle(d.key).color}
        />
      {/each}
      {#each values as d}
        <path
          d={draw(d.value.map((e) => ({ x: e.x, y: e.to })))}
          stroke={d.isContext ? getStyle(d.key).contextColor : getStyle(d.key).color}
          stroke-width={getStyle(d.key).width}
          fill="none"
        />
      {/each}
    {:else}
      {#if lineSpec.fill}
        {#each values as d}
          <path
            d={draw(
              d.value.concat([
                { ...d.value[d.value.length - 1], y: 0 },
                { ...d.value[0], y: 0 },
              ]),
            )}
            fill={d.isContext ? getStyle(d.key).contextColor : getStyle(d.key).color}
          />
        {/each}
      {/if}
      {#each values as d}
        <path
          d={draw(d.value)}
          stroke={d.type == "missing" && getStyle(d.key).missingStyle == LineMissingStyle.NONE
            ? "none"
            : d.isContext
              ? getStyle(d.key).contextColor
              : getStyle(d.key).color}
          stroke-width={higlight === d.key ? getStyle(d.key).width + 2 : getStyle(d.key).width}
          fill="none"
          stroke-dasharray={d.type == "line" ||
          getStyle(d.key).missingStyle == LineMissingStyle.LINE
            ? null
            : "3"}
        />
      {/each}
    {/if}

    <g bind:contentRect={labelBox}>
      {#each values as d, i}
        {#if getStyle(d.key).label.location == LabelLocation.Right}
          {#if values.length == i + 1 || values[i + 1].key !== d.key}
            <text
              x={xScale(d.value[d.value.length - 1].x) + labelOffset}
              y={yScale(d.value[d.value.length - 1].to)}
              fill={getStyle(d.key).label.color}
              paint-order="stroke"
              stroke={chartSpec.style.bgColor}
              stroke-width={3}
              dominant-baseline="middle"
              text-anchor="start">{getStyle(d.key).label.text}</text
            >
          {/if}
        {:else if getStyle(d.key).label.location == LabelLocation.Left}
          {#if i == 0 || values[i - 1].key !== d.key}
            <text
              x={xScale(d.value[0].x) - labelOffset}
              y={yScale(d.value[0].to)}
              fill={getStyle(d.key).label.color}
              paint-order="stroke"
              stroke={chartSpec.style.bgColor}
              stroke-width={3}
              dominant-baseline="middle"
              text-anchor="end">{getStyle(d.key).label.text}</text
            >
          {/if}
        {/if}
      {/each}
    </g>
    {#each values as d}
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
      {xScale}
      {yScale}
      {editor}
      on:edit={(e) => dispatch("edit", ["style", ...e.detail])}
    />
  </g>
</svg>

<style>
  path {
    stroke-linejoin: round;
  }
</style>
