<script lang="ts">
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import { formatNumber, orDefault, orNumber } from "$lib/utils";
  import type { Axis } from "$lib/chart";
  import { AxisLocation, AxisOrientation } from "$lib/chart";
  import { createEventDispatcher } from "svelte";

  export let conf: Axis;
  export let width: number;
  export let height: number;
  export let scale: ScaleLinear<number, number, never> | ScaleTime<number, number, never> | undefined;
  export let showLabels = true;

  let size = 16;
  $: lineOffset = showLabels && conf.location == AxisLocation.START ? size : 0;
  const maxTicks = 200;

  let labelBox: DOMRect | undefined;
  let leftBox: DOMRect | undefined;
  let rightBox: DOMRect | undefined;

  const distpatch = createEventDispatcher<{
    dimensions: {
      width: number,
      height: number,
      leftOverflow?: number,
      rightOverflow?: number
    },
  }>();

  $: if (labelBox || leftBox || rightBox) distpatch("dimensions", {
    width: orNumber(labelBox?.width, 0) + conf.labelSpace,
    height: orNumber(labelBox?.height, 0),
    leftOverflow: Math.max(
      orNumber(leftBox?.width, 0) / 2 -
        (scale
          ? Math.floor(
              (scale(orDefault(majorTicks[0]?.n, 0)) - scale.range()[0]) / 10,
            ) * 10
          : 0),
      0,
    ),
    rightOverflow: orNumber(rightBox?.width, 0)/2,
  });

  let autoMajorTicks: { n: number | Date; l: string }[] = [];
  let manualMajorTicks: {
    n: number;
    l: string;
  }[] = [];
  $: {
    if (scale && conf.major.enabled && conf.major.auto.each != 0) {
      // Note: we are not allowed to assign these two variables to new values after this, or we
      // get a weird reactive loop when we access it in the reactive block that dispatch stuff.
      autoMajorTicks = [];
      manualMajorTicks = [];
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        const customFrom = Math.max(Math.min(conf.major.auto.from, to), from);
        const expectedTicks =
          1 + (to - customFrom) / conf.major.auto.each;
        if (expectedTicks > maxTicks) {
          autoMajorTicks = [
            { n: from, l: `Too many ticks (${expectedTicks})` },
          ];
        } else {
          for (let i = customFrom; i <= to; i += conf.major.auto.each) {
            autoMajorTicks.push({
              n: i,
              l: conf.major.auto.labels ? formatNumber(
                i,
                conf.major.labelDivide,
                conf.major.labelThousands,
              ) + conf.major.afterLabel : "",
            });
          }
        }
        manualMajorTicks.concat(conf.major.ticks.filter(d => d.n <= to && customFrom <= d.n));
      } else if (to instanceof Date && from instanceof Date) {
        let d = new Date(from);
        d.setDate(1);
        d.setMonth(0);
        let n = 0;
        while (d <= to && n < maxTicks) {
          autoMajorTicks.push({
            n: new Date(d),
            l: conf.major.auto.labels ? d.getFullYear() + conf.major.afterLabel : "",
          });
          d.setFullYear(d.getFullYear() + conf.major.auto.each);
          n++;
        }
      }
    }
  }
  $: majorTicks = scale ? [...manualMajorTicks, ...autoMajorTicks] : [];

  let autoMinorTicks: { n: number | Date; l: string }[] = [];
  let manualMinorTicks: {
    n: number;
    l: string;
  }[] = [];
  $: {
    if (scale && conf.minor.enabled && conf.minor.auto.each != 0) {
      autoMinorTicks = [];
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        const expectedTicks =
          1 + (to - conf.minor.auto.from) / conf.minor.auto.each;
        if (expectedTicks > maxTicks) {
          autoMinorTicks = [
            { n: from, l: `Too many ticks (${expectedTicks})` },
          ];
        } else {
          for (let i = conf.minor.auto.from; i <= to; i += conf.minor.auto.each) {
            autoMinorTicks.push({
              n: i,
              l: conf.minor.auto.labels ? formatNumber(
                i,
                conf.minor.labelDivide,
                conf.minor.labelThousands,
              ) + conf.minor.afterLabel : "",
            });
          }
        }
        manualMinorTicks = conf.minor.ticks.filter(d => d.n <= to && from <= d.n);
      } else if (to instanceof Date && from instanceof Date) {
        let d = new Date(from);
        d.setDate(1);
        d.setMonth(0);
        let n = 0;
        while (d <= to && n < maxTicks) {
          autoMinorTicks.push({
            n: new Date(d),
            l: conf.minor.auto.labels ? d.getFullYear() + conf.minor.afterLabel : "",
          });
          d.setFullYear(d.getFullYear() + conf.minor.auto.each);
          n++;
        }
      }
    }
  }
  $: minorTicks = scale
    ? [...manualMinorTicks, ...autoMinorTicks].filter(
        (d) => !majorTicks.find((dd) => dd.l != "" && dd.n == d.n),
      )
    : [];
</script>

{#if scale}
  {#if conf.orientation == AxisOrientation.HORIZONTAL}
    {#if conf.minor.enabled}
      {#if conf.location == AxisLocation.START}
        {#each minorTicks as tick}
          <path
            d="m {scale(tick.n)},{lineOffset - conf.minor.tickSize} L {scale(tick.n)},{conf.minor.grid
              ? height
              : lineOffset}"
            stroke={conf.minor.color}
            stroke-width={conf.minor.tickWidth}
          />
        {/each}
      {:else}
        {#each minorTicks as tick}
          <path
            d="m {scale(tick.n)},{height + conf.minor.tickSize} L {scale(tick.n)},{(conf.minor.grid
              ? 0
              : height)}"
            stroke={conf.minor.color}
            stroke-width={conf.minor.tickWidth}
          />
        {/each}
      {/if}
    {/if}

    {#if conf.major.enabled}
      {#each majorTicks as tick, i}
        {#if conf.location == AxisLocation.START}
          <path
            d="m {scale(tick.n)},{lineOffset - conf.major.tickSize} L {scale(tick.n)},{conf.major.grid
              ? height
              : lineOffset}"
            stroke={conf.major.color}
            stroke-width={conf.major.tickWidth}
          />
        {:else}
          <path
            d="m {scale(tick.n)},{height + conf.major.tickSize} L {scale(tick.n)},{(conf.major.grid
              ? -0
              : height)}"
            stroke={conf.major.color}
            stroke-width={conf.major.tickWidth}
          />
        {/if}
        {#if showLabels}
          {#if conf.location == AxisLocation.START && tick.l}
            <text
              text-anchor="middle"
              dominant-baseline="hanging"
              font-size={size}
              x={scale(tick.n)}>{tick.l}</text
            >
          {:else if conf.location == AxisLocation.END && tick.l}
            <text
              text-anchor="middle"
              y={height + size}
              font-size={size}
              x={scale(tick.n)}>{tick.l}</text
            >
          {/if}

          <!-- Used to calculate labels overflowing outside of chart area -->
          {#if i == 0}
            <text
              text-anchor="middle"
              bind:contentRect={leftBox}
              font-size={size}
              x={scale(tick.n)}
              visibility="hidden"
              aria-hidden="true">{tick.l}</text
            >
          {:else if i == majorTicks.length - 1}
            <text
              text-anchor="middle"
              bind:contentRect={rightBox}
              font-size={size}
              x={scale(tick.n)}
              visibility="hidden"
              aria-hidden="true">{tick.l}</text
            >
          {/if}
        {/if}
      {/each}
    {/if}
  {:else}
    <g bind:contentRect={labelBox}>
      {#if conf.major.enabled}
        {#each majorTicks as tick}
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

      {#if conf.minor.enabled}
        {#each minorTicks as tick}
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
      {#each majorTicks as tick}
        <g transform="translate(0, {scale(tick.n)})">
          <line
            x1={0}
            y1={0}
            x2={conf.major.grid ? width : conf.major.tickSize}
            y2={0}
            stroke={conf.major.color}
          />
        </g>
      {/each}
    {/if}

    {#if conf.minor.enabled}
      {#each minorTicks as tick}
        <g transform="translate(0, {scale(tick.n)})">
          <line
            x1={0}
            y1={0}
            x2={conf.minor.grid ? width : conf.minor.tickSize}
            y2={0}
            stroke={conf.minor.color}
          />
        </g>
      {/each}
    {/if}
  {/if}
{/if}
