<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { scaleLinear, scaleTime, type ScaleLinear, type ScaleTime } from "d3-scale";
  import { formatNumber, orDefault, orNumber } from "$lib/utils";
  import type { Axis, AxisGrid, Row } from "$lib/chart";
  import { AxisLocation, AxisOrientation } from "$lib/chart";
  import dayjs from "dayjs";

  interface Props {
    conf: Axis;
    row?: Row;
    width: number;
    height: number;
    scale: ScaleLinear<number, number, never> | ScaleTime<number, number, never> | undefined;
    showLabels?: boolean;
    dimensions?: (d: {
      width: number;
      height: number;
      leftOverflow?: number;
      rightOverflow?: number;
      topPos?: number;
      labelHeight: number;
    }) => void;
  }

  let { conf, width, height, scale, showLabels = true, dimensions = () => {} }: Props = $props();

  let bbs: SVGTextElement | undefined = $state();
  let labelBox: DOMRect | undefined = $state();
  let leftBox: DOMRect | undefined = $state();
  let rightBox: DOMRect | undefined = $state();
  let testBox: DOMRect | undefined = $state();

  let size = $derived(conf.major.enabled ? (bbs?.getBoundingClientRect().height ?? 0) : 0);

  let lineOffset = $derived(showLabels && conf.location == AxisLocation.START ? size : 0);

  $effect(() => {
    if (labelBox || leftBox || rightBox)
      dimensions({
        width: orNumber(labelBox?.width, 0),
        height: orNumber(labelBox?.height, 0),
        leftOverflow: Math.max(
          orNumber(leftBox?.width, 0) / 2 -
            (scale
              ? Math.floor((scale(orDefault(majorTicks[0]?.n, 0)) - scale.range()[0]) / 10) * 10
              : 0),
          0,
        ),
        rightOverflow: orNumber(rightBox?.width, 0) / 2,
        topPos:
          majorTicks.length == 0 ||
          majorTicks[majorTicks.length - 1].l == "" ||
          typeof scale == "undefined"
            ? undefined
            : scale(majorTicks[majorTicks.length - 1]?.n ?? 0) - orNumber(testBox?.height, 0) - 6,
        labelHeight: orNumber(testBox?.height, 0) + conf.major.tickSize,
      });
  });

  // $effect(() => {
  //   if (scale && conf.major.enabled && conf.major.auto.each != 0) {
  //     // Note: we are not allowed to assign these two variables to new values after this, or we
  //     // get a weird reactive loop when we access it in the reactive block that dispatch stuff.
  //     let computedMajorTicks: typeof autoMajorTicks = [];
  //     let computedManualMajorTicks: typeof manualMajorTicks = [];
  //     const from = scale.domain()[0];
  //     const to = scale.domain()[1];
  //     if (typeof to == "number" && typeof from == "number") {
  //       if (conf.major.auto.from != "") {
  //         const customFrom = Math.max(
  //           Math.min(Number.parseFloat(conf.major.auto.from || "0"), to),
  //           from,
  //         );
  //         const expectedTicks = 1 + (to - customFrom) / conf.major.auto.each;
  //         if (expectedTicks > maxTicks) {
  //           computedMajorTicks = [
  //             { n: from, l: `Too many ticks (${expectedTicks})`, textAnchor: "middle" },
  //           ];
  //         } else {
  //           for (let i = customFrom; i <= to; i += conf.major.auto.each) {
  //             computedMajorTicks.push({
  //               n: i,
  //               l: conf.major.auto.labels
  //                 ? formatNumber(i, conf.major.labelDivide, conf.major.labelThousands) +
  //                   conf.major.afterLabel
  //                 : "",
  //               textAnchor: "middle",
  //             });
  //           }
  //         }
  //         computedManualMajorTicks = conf.major.ticks
  //           .filter((d) => d.n <= to && from <= d.n)
  //           .map((e) => ({ ...e, textAnchor: "middle" }));
  //       } else {
  //         const ticks = scaleLinear([from, to], [0, 1]).nice().ticks(3);
  //         ticks.forEach((tick) => {
  //           return computedMajorTicks.push({
  //             l: conf.major.auto.labels
  //               ? formatNumber(tick, conf.major.labelDivide, conf.major.labelThousands) +
  //                 conf.major.afterLabel
  //               : "",
  //             n: tick,
  //             textAnchor: "middle",
  //           });
  //         });
  //       }
  //     } else if (to instanceof Date && from instanceof Date) {
  //       if (!row) {
  //         console.warn("axis row is not set");
  //         autoMajorTicks = [];

  //         return;
  //       }
  //       const ticks = scaleTime([new Date(from), new Date(to)], [0, 1])
  //         .nice()
  //         .ticks(3);
  //       ticks.forEach((tick) => {
  //         return computedMajorTicks.push({
  //           l: "" + dayjs(tick).format("YYYY"),
  //           n: tick,
  //           textAnchor: "middle",
  //         });
  //       });
  //       // let d = dayjs(conf.major.auto.from, row.dateFormat || row.type).toDate();
  //       // d.setDate(1);
  //       // d.setMonth(0);
  //       // let n = 0;
  //       // while (d <= to && n < maxTicks) {
  //       //   computedMajorTicks.push({
  //       //     n: new Date(d),
  //       //     l: conf.major.auto.labels ? d.getFullYear() + conf.major.afterLabel : "",
  //       //     textAnchor: "middle",
  //       //   });
  //       //   d.setFullYear(d.getFullYear() + conf.major.auto.each);
  //       //   n++;
  //       // }
  //     }
  //     autoMajorTicks = computedMajorTicks.filter(
  //       (d) => computedManualMajorTicks.findIndex((dd) => dd.n == d.n) == -1,
  //     );
  //     manualMajorTicks = computedManualMajorTicks;
  //   }
  // });

  // $effect(() => {
  //   if (scale && conf.minor.enabled && conf.minor.auto.each != 0) {
  //     let computedMinorTicks: typeof autoMinorTicks = [];
  //     const from = scale.domain()[0];
  //     const to = scale.domain()[1];
  //     if (typeof to == "number" && typeof from == "number") {
  //       const expectedTicks =
  //         1 + (to - Number.parseFloat(conf.minor.auto.from || "0")) / conf.minor.auto.each;
  //       if (expectedTicks > maxTicks) {
  //         computedMinorTicks = [{ n: from, l: `Too many ticks (${expectedTicks})` }];
  //       } else {
  //         for (
  //           let i = Number.parseFloat(conf.minor.auto.from || "0");
  //           i <= to;
  //           i += conf.minor.auto.each
  //         ) {
  //           computedMinorTicks.push({
  //             n: i,
  //             l: conf.minor.auto.labels
  //               ? formatNumber(i, conf.minor.labelDivide, conf.minor.labelThousands) +
  //                 conf.minor.afterLabel
  //               : "",
  //           });
  //         }
  //       }
  //       manualMinorTicks = conf.minor.ticks.filter((d) => d.n <= to && from <= d.n);
  //     } else if (to instanceof Date && from instanceof Date) {
  //       /* eslint-disable-next-line svelte/prefer-svelte-reactivity */
  //       let d = new Date(from);
  //       d.setDate(1);
  //       d.setMonth(0);
  //       let n = 0;
  //       while (d <= to && n < maxTicks) {
  //         computedMinorTicks.push({
  //           n: new Date(d),
  //           l: conf.minor.auto.labels ? d.getFullYear() + conf.minor.afterLabel : "",
  //         });
  //         d.setFullYear(d.getFullYear() + conf.minor.auto.each);
  //         n++;
  //       }
  //     }

  //     autoMinorTicks = computedMinorTicks;
  //   }
  // });
  const genTicks = $derived((n: number, axis: AxisGrid): typeof majorTicks => {
    if (scale && axis.enabled) {
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        // Manual
        const ticks: typeof majorTicks = axis.ticks.map((tick) => ({
          l: tick.l,
          n: tick.n,
          textAnchor: "middle",
        }));

        // Auto but only if there's no manual
        scaleLinear([from, to], [0, 1])
          .nice()
          .ticks(n)
          .forEach((tick) => {
            if (ticks.findIndex((d) => d.n == tick) == -1)
              ticks.push({
                l: axis.auto.labels
                  ? formatNumber(tick, axis.labelDivide, axis.labelThousands) + axis.afterLabel
                  : "",
                n: tick,
                textAnchor: "middle",
              });
          });

        return ticks;
      } else if (to instanceof Date && from instanceof Date) {
        // Manual TODO
        const ticks: typeof majorTicks = [];

        // Auto but only if there's no manual
        scaleTime([new Date(from), new Date(to)], [0, 1])
          .nice()
          .ticks(n)
          .forEach((tick) => {
            if (ticks.findIndex((d) => d.n == tick) == -1)
              ticks.push({
                l: "" + dayjs(tick).format("YYYY"),
                n: tick,
                textAnchor: "middle",
              });
          });

        return ticks;
      }
    }

    return [];
  });
  let majorTicks: { n: number | Date; l: string; textAnchor: "start" | "middle" | "end" }[] =
    $derived(
      scale
        ? genTicks(3, conf.major)
            .sort((a, b) =>
              a.n instanceof Date && b.n instanceof Date
                ? a.n.getTime() - b.n.getTime()
                : typeof a.n == "number" && typeof b.n == "number"
                  ? a.n - b.n
                  : 0,
            )
            .map((e, i, arr) => ({
              ...e,
              textAnchor:
                arr.filter((e) => e.l != "").length <= 2 &&
                ((e.n instanceof Date &&
                  scale.domain()[0] instanceof Date &&
                  // @ts-expect-error: if e.n is a date, then scale.domain will also return dates
                  (scale.domain()[0].getTime() == e.n.getTime() ||
                    // @ts-expect-error: if e.n is a date, then scale.domain will also return dates
                    scale.domain()[1].getTime() == e.n.getTime())) ||
                  scale.domain()[0] == e.n ||
                  scale.domain()[1] == e.n)
                  ? i == 0
                    ? "start"
                    : "end"
                  : "middle",
            }))
        : [],
    );
  let minorTicks = $derived(scale ? genTicks(15, conf.minor) : []);
</script>

<text bind:contentRect={testBox} aria-hidden="true" visibility="hidden">123</text>
{#if scale}
  {#if conf.orientation == AxisOrientation.HORIZONTAL}
    {#if conf.minor.enabled}
      <g class="axis-minor axis-horizontal">
        {#if conf.location == AxisLocation.START}
          {#each minorTicks as tick, i (i)}
            <path
              d="m {scale(tick.n)},{lineOffset - conf.minor.tickSize} L {scale(tick.n)},{conf.minor
                .grid
                ? height
                : lineOffset}"
              stroke="var(--axis-line-color)"
              stroke-width={conf.minor.tickWidth}
            />
          {/each}
        {:else}
          {#each minorTicks as tick, i (i)}
            <path
              d="m {scale(tick.n)},{height + conf.minor.tickSize} L {scale(tick.n)},{conf.minor.grid
                ? 0
                : height}"
              stroke="var(--axis-line-color)"
              stroke-width={conf.minor.tickWidth}
            />
          {/each}
        {/if}
      </g>
    {/if}

    {#if conf.major.enabled}
      <g class="axis-major axis-horizontal">
        {#each majorTicks as tick, i (i)}
          {#if conf.location == AxisLocation.START}
            <path
              d="m {scale(tick.n)},{lineOffset - conf.major.tickSize} L {scale(tick.n)},{conf.major
                .grid
                ? height
                : lineOffset}"
              stroke="var(--axis-line-color)"
              stroke-width={conf.major.tickWidth}
            />
          {:else}
            <path
              d="m {scale(tick.n)},{height + conf.major.tickSize} L {scale(tick.n)},{conf.major.grid
                ? -0
                : height}"
              stroke="var(--axis-line-color)"
              stroke-width={conf.major.tickWidth}
            />
          {/if}

          {#if showLabels}
            {#if conf.location == AxisLocation.START && tick.l}
              <text text-anchor={tick.textAnchor} dy="1em" x={scale(tick.n)}>{tick.l}</text>
            {:else if conf.location == AxisLocation.END && tick.l}
              <text
                text-anchor={tick.textAnchor}
                y={height + conf.major.tickSize + size}
                x={scale(tick.n)}>{tick.l}</text
              >
            {/if}

            <!-- Used to calculate labels overflowing outside of chart area -->
            {#if i == 0}
              <text
                text-anchor={tick.textAnchor}
                bind:contentRect={leftBox}
                bind:this={bbs}
                x={scale(tick.n)}
                visibility="hidden"
                aria-hidden="true">{tick.l}</text
              >
            {:else if i == majorTicks.length - 1}
              <text
                text-anchor={tick.textAnchor}
                bind:contentRect={rightBox}
                x={scale(tick.n)}
                visibility="hidden"
                aria-hidden="true">{tick.l}</text
              >
            {/if}
          {/if}
        {/each}
      </g>
    {/if}
  {:else}
    <g bind:contentRect={labelBox}>
      {#if conf.major.enabled}
        <g class="axis-major axis-vertical">
          {#each majorTicks as tick, i (i)}
            <g transform="translate(0, {scale(tick.n)})">
              {#if showLabels}
                {#if conf.location == AxisLocation.START && tick.l}
                  <text x={0} y={-6}>{tick.l}</text>
                {:else if conf.location == AxisLocation.END && tick.l}
                  <text x={width} y={-6} text-anchor="end">{tick.l}</text>
                {/if}
              {/if}
            </g>
          {/each}
        </g>
      {/if}

      {#if conf.minor.enabled}
        {#each minorTicks as tick, i (i)}
          <g transform="translate(0, {scale(tick.n)})">
            {#if showLabels}
              {#if conf.location == AxisLocation.START && tick.l}
                <text x={0} y={-6}>{tick.l}</text>
              {:else if conf.location == AxisLocation.END && tick.l}
                <text x={width} y={-6} text-anchor="end">{tick.l}</text>
              {/if}
            {/if}
          </g>
        {/each}
      {/if}
    </g>

    {#if conf.major.enabled}
      <g class="axis-major axis-vertical">
        {#each majorTicks as tick (tick.n)}
          <g transform="translate(0, {scale(tick.n)})">
            <line
              x1={0}
              y1={0}
              x2={conf.major.grid ? width : conf.major.tickSize}
              y2={0}
              stroke="var(--axis-line-color)"
              stroke-width={conf.major.tickWidth}
            />
          </g>
        {/each}
      </g>
    {/if}

    {#if conf.minor.enabled}
      <g class="axis-minor axis-vertical">
        {#each minorTicks as tick, i (i)}
          <g transform="translate(0, {scale(tick.n)})">
            <line
              x1={0}
              y1={0}
              x2={conf.minor.grid ? width : conf.minor.tickSize}
              y2={0}
              stroke="var(--axis-line-color)"
            />
          </g>
        {/each}
      </g>
    {/if}
  {/if}
{/if}

<style>
  text {
    font-size: var(--axis-text-size);
  }
</style>
