<!-- SPDX-License-Identifier: MPL-2.0 -->

<!--
  One scatter plot. The Holder renders one of these per small-multiples chart
  and passes the shared value domain so all charts are comparable. Context
  series (series from other charts marked "show on all charts") render muted
  behind this chart's own series.
-->

<script lang="ts">
  import { scaleLinear, scaleSqrt } from "d3-scale";
  import { curveBumpX, curveBumpY, curveCardinal, curveLinear, line } from "d3-shape";
  import { AxisLocation, type Root, type Set } from "$lib/chart";
  import { orNumber } from "$lib/utils";
  import { fontStore } from "$lib/fontStore.svelte";
  import {
    ScatterCurve,
    ScatterLabelMode,
    ScatterXAxisLabelLocation,
    ScatterYAxisLabelLocation,
    type ScatterElement,
  } from ".";
  import type { ScatterSeries } from "./data";
  import Axis from "../Axis.svelte";
  import PointLabels from "./PointLabels.svelte";
  import AxisTitles from "./AxisTitles.svelte";
  import AnnotationBoxes from "../Annotations/AnnotationBoxes.svelte";
  import AnnotationTexts from "../Annotations/AnnotationTexts.svelte";
  import { linearAnnotationGeometry, type AnnotationCoordinate } from "../Annotations/annotations";

  const curves = {
    [ScatterCurve.LINEAR]: curveLinear,
    [ScatterCurve.CARDINAL]: curveCardinal,
    [ScatterCurve.BUMP_X]: curveBumpX,
    [ScatterCurve.BUMP_Y]: curveBumpY,
  };

  interface Props {
    chartSpec: Root;
    componentSpec: ScatterElement;
    series: ScatterSeries[];
    /** Series from other small-multiples charts, drawn muted behind this chart's own */
    contextSeries: ScatterSeries[];
    width: number;
    editor?: boolean;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    /** Largest size value across all charts, keeps bubbles comparable */
    maxRValue: number;
    dataSet: Set | undefined;
    onedit?: (d: any[]) => void;
  }

  let {
    componentSpec,
    series,
    contextSeries,
    width,
    editor = false,
    minX,
    maxX,
    minY,
    maxY,
    maxRValue,
    dataSet,
    onedit = () => {},
  }: Props = $props();

  let height = $derived(width * componentSpec.heightRatio);

  let yAxisWidth = $state(0);
  let yAxisTop = $state(0);
  let xAxisOverflow: { leftOverflow?: number; rightOverflow?: number } = $state({
    leftOverflow: 0,
    rightOverflow: 0,
  });
  let bottomMargin = $state(0);
  const margin = 8;

  // Extra margin bands reserved for axis labels in use
  const axisTitleBand = 20;
  let xTitle = $derived(
    componentSpec.x.label ?? { text: "", location: ScatterXAxisLabelLocation.BELOW },
  );
  let yTitle = $derived(
    componentSpec.y.label ?? { text: "", location: ScatterYAxisLabelLocation.ABOVE_LEFT },
  );
  let titleTop = $derived(
    (xTitle.text != "" && xTitle.location == ScatterXAxisLabelLocation.ABOVE) ||
      (yTitle.text != "" &&
        (yTitle.location == ScatterYAxisLabelLocation.ABOVE_LEFT ||
          yTitle.location == ScatterYAxisLabelLocation.ABOVE_RIGHT))
      ? axisTitleBand
      : 0,
  );
  let titleBottom = $derived(
    (xTitle.text != "" && xTitle.location == ScatterXAxisLabelLocation.BELOW) ||
      (yTitle.text != "" &&
        (yTitle.location == ScatterYAxisLabelLocation.BELOW_LEFT ||
          yTitle.location == ScatterYAxisLabelLocation.BELOW_RIGHT))
      ? axisTitleBand
      : 0,
  );
  let titleLeft = $derived(
    yTitle.text != "" && yTitle.location == ScatterYAxisLabelLocation.ROTATED_LEFT
      ? axisTitleBand
      : 0,
  );
  let titleRight = $derived(
    yTitle.text != "" && yTitle.location == ScatterYAxisLabelLocation.ROTATED_RIGHT
      ? axisTitleBand
      : 0,
  );

  // Keep points inside the plot area, whichever of the axis labels or the
  // point radius takes the most space wins.
  let topMargin = $derived(Math.max(yAxisTop, componentSpec.radius));
  let leftMargin = $derived(
    Math.max(
      componentSpec.y.axis.location == AxisLocation.START ? yAxisWidth : 0,
      orNumber(xAxisOverflow.leftOverflow, 0),
      componentSpec.radius,
    ) +
      margin +
      titleLeft,
  );
  let rightMargin = $derived(
    Math.max(
      componentSpec.y.axis.location == AxisLocation.END ? yAxisWidth : 0,
      orNumber(xAxisOverflow.rightOverflow, 0),
      componentSpec.radius,
    ) +
      margin +
      titleRight,
  );

  let xScale = $derived(
    scaleLinear()
      .domain([minX, maxX])
      .range([leftMargin, width - rightMargin])
      .nice(),
  );
  let yScale = $derived(scaleLinear().domain([minY, maxY]).range([height, 0]).nice());

  // Area-proportional point sizes, the largest value gets the configured radius
  let rScale = $derived(
    scaleSqrt()
      .domain([0, Math.max(maxRValue, 1)])
      .range([0, componentSpec.radius]),
  );
  let circleRadius = $derived((p: { r?: number }) =>
    typeof p.r == "undefined" ? componentSpec.radius : Math.max(rScale(p.r), 1),
  );

  let draw = $derived(
    line<{ x: number; y: number }>()
      .x((p) => xScale(p.x))
      .y((p) => yScale(p.y))
      .curve(curves[componentSpec.curve] ?? curveLinear),
  );

  const pointTitle = (p: { x: number; y: number; r?: number; label: string }) =>
    (p.label != "" ? p.label + ": " : "") +
    p.x +
    ", " +
    p.y +
    (typeof p.r == "undefined" ? "" : ", " + p.r);

  let labelPoints = $derived.by(() => {
    const mode = componentSpec.labelMode ?? ScatterLabelMode.NONE;
    if (mode == ScatterLabelMode.NONE) {
      return [];
    }
    return series.flatMap((s) => {
      const points =
        mode == ScatterLabelMode.ALL
          ? s.points
          : mode == ScatterLabelMode.END_POINTS
            ? [...s.points.slice(0, 1), ...s.points.slice(-1)]
            : mode == ScatterLabelMode.FIRST
              ? s.points.slice(0, 1)
              : s.points.slice(-1);
      return points
        .map((p, i) => ({
          key: s.k + "." + i,
          x: xScale(p.x),
          y: yScale(p.y),
          r: circleRadius(p),
          text: p.label,
          color: s.settings?.color.light.c ?? "#000000",
          title: pointTitle(p),
        }))
        .filter((d) => d.text != "");
    });
  });
  let obstaclePoints = $derived(
    [...contextSeries, ...series].flatMap((s) =>
      s.points.map((p) => ({ x: xScale(p.x), y: yScale(p.y), r: circleRadius(p) })),
    ),
  );

  let annotations = $derived(componentSpec.annotations ?? []);
  let annotationGeometry = $derived(linearAnnotationGeometry(xScale, yScale));
  const onAnnotationEdit = (i: number, changes: { [key: string]: AnnotationCoordinate }) =>
    onedit(["annotations", i, changes]);
</script>

<div class="scatter-plot">
  <svg
    {width}
    height={height +
      topMargin +
      titleTop +
      Math.max(bottomMargin, componentSpec.radius) +
      componentSpec.x.axis.major.tickWidth * 2 +
      titleBottom}
  >
    <style bind:innerHTML={fontStore.fontCSS} contenteditable=""></style>
    <g transform="translate(0, {topMargin + titleTop})">
      <AnnotationBoxes
        {annotations}
        geometry={annotationGeometry}
        {editor}
        onedit={onAnnotationEdit}
      />
      <!-- The y axis spans gridlines and anchors labels to the full width it is
      given, shrink and shift it so rotated axis labels get their own space -->
      <g transform="translate({titleLeft}, 0)">
        <Axis
          {height}
          width={width - titleLeft - titleRight}
          scale={yScale}
          conf={componentSpec.y.axis}
          dimensions={(d) => {
            yAxisWidth = d.width;
            yAxisTop = Math.max(-(d.topPos ?? 0), 0);
          }}
          row={dataSet?.rows.find((e) => e.key == componentSpec.y.key)}
        />
      </g>
      <Axis
        {height}
        {width}
        scale={xScale}
        conf={componentSpec.x.axis}
        dimensions={(d) => {
          xAxisOverflow = d;
          bottomMargin = d.labelHeight;
        }}
        row={dataSet?.rows.find((e) => e.key == componentSpec.x.key)}
      />
      {#if componentSpec.connect}
        {#each contextSeries as s, si (si + "." + s.k)}
          {#each s.segments as segment, i (i)}
            <path
              class="scatter-line scatter-line-context"
              d={draw(segment.points)}
              fill="none"
              stroke="var(--axis-line-color)"
              stroke-width="2"
              stroke-dasharray={segment.type == "missing" ? "3" : null}
            />
          {/each}
        {/each}
      {/if}
      {#each contextSeries as s, si (si + "." + s.k)}
        {#each s.points as p, i (i)}
          <circle
            class="scatter-context-point"
            cx={xScale(p.x)}
            cy={yScale(p.y)}
            r={circleRadius(p)}
            fill="var(--axis-line-color)"
            fill-opacity={componentSpec.opacity}
            stroke="var(--background-color)"
            stroke-width="2"
          >
            <title>{pointTitle(p)}</title>
          </circle>
        {/each}
      {/each}
      {#if componentSpec.connect}
        {#each series as s (s.k)}
          {#each s.segments as segment, i (i)}
            <path
              class="scatter-line"
              d={draw(segment.points)}
              fill="none"
              stroke={s.settings?.color.light.c ?? "#000000"}
              stroke-width="2"
              stroke-dasharray={segment.type == "missing" ? "3" : null}
            />
          {/each}
        {/each}
      {/if}
      {#each series as s (s.k)}
        {#each s.points as p, i (i)}
          <circle
            cx={xScale(p.x)}
            cy={yScale(p.y)}
            r={circleRadius(p)}
            fill={s.settings?.color.light.c ?? "#000000"}
            fill-opacity={componentSpec.opacity}
            stroke="var(--background-color)"
            stroke-width="2"
          >
            <title>{pointTitle(p)}</title>
          </circle>
        {/each}
      {/each}
      {#if labelPoints.length != 0}
        <PointLabels
          items={labelPoints}
          obstacles={obstaclePoints}
          bounds={{ x0: 0, y0: -topMargin, x1: width, y1: height }}
        />
      {/if}
      <AxisTitles
        xLabel={xTitle}
        yLabel={yTitle}
        {width}
        {height}
        top={-topMargin - titleTop}
        bottom={height +
          Math.max(bottomMargin, componentSpec.radius) +
          componentSpec.x.axis.major.tickWidth * 2 +
          titleBottom}
        centerX={(xScale.range()[0] + xScale.range()[1]) / 2}
      />
    </g>
  </svg>
  {#if annotations.some((a) => a.type == "text")}
    <AnnotationTexts
      {annotations}
      geometry={annotationGeometry}
      offset={{ x: 0, y: topMargin + titleTop }}
      {editor}
      onedit={onAnnotationEdit}
    />
  {/if}
</div>

<style>
  .scatter-plot {
    position: relative;
  }
</style>
