<script lang="ts">
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import { formatNumber } from "$lib/utils";
  import type { Axis } from "$lib/chart";
  import { AxisLocation, AxisOrientation } from "$lib/chart";

  export let conf: Axis;
  export let width: number;
  export let height: number;
  export let scale: ScaleLinear<number, number, never> | ScaleTime<number, number, never> | undefined;
  export let showLabels = true;

  let size = 16;
  $: lineOffset = showLabels && conf.location == AxisLocation.START ? size : 0;
  const maxTicks = 200;

  let autoMajorTicks: { n: number | Date; l: string }[] = [];
  $: {
    if (scale) {
      autoMajorTicks = [];
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        const expectedTicks =
          1 + (to - from) / conf.major.auto.each;
        if (expectedTicks > maxTicks) {
          autoMajorTicks = [
            { n: from, l: `Too many ticks (${expectedTicks})` },
          ];
        } else {
          for (let i = from; i <= to; i += conf.major.auto.each) {
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
  $: majorTicks = scale ? [...conf.major.ticks, ...autoMajorTicks] : [];

  let autoMinorTicks: { n: number | Date; l: string }[] = [];
  $: {
    if (scale) {
      autoMinorTicks = [];
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        const expectedTicks =
          1 + (to - from) / conf.minor.auto.each;
        if (expectedTicks > maxTicks) {
          autoMinorTicks = [
            { n: from, l: `Too many ticks (${expectedTicks})` },
          ];
        } else {
          for (let i = from; i <= to; i += conf.minor.auto.each) {
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
  $: minorTicks = scale ? [...conf.minor.ticks, ...autoMinorTicks] : [];
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
      {#each majorTicks as tick}
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
        {/if}
      {/each}
    {/if}
  {:else}
    {#if conf.major.enabled}
      {#each autoMajorTicks as tick}
        <g transform="translate(0, {scale(tick.n)})">
          <line
            x1={0}
            y1={0}
            x2={conf.major.grid ? width : conf.major.tickSize}
            y2={0}
            stroke={conf.major.color}
          />
          {#if showLabels}
            {#if conf.location == AxisLocation.START && tick.l}
              <text x={conf.labelSpace} y={-6}>{tick.l}</text>
            {:else if conf.location == AxisLocation.END && tick.l}
              <text x={width - conf.labelSpace} y={-6}>{tick.l}</text>
            {/if}
          {/if}
        </g>
      {/each}
    {/if}

    {#if conf.minor.enabled}
      {#each autoMinorTicks as tick}
        <g transform="translate(0, {scale(tick.n)})">
          <line
            x1={0}
            y1={0}
            x2={conf.minor.grid ? width : conf.minor.tickSize}
            y2={0}
            stroke={conf.minor.color}
          />
          {#if showLabels}
            {#if conf.location == AxisLocation.START && tick.l}
              <text x={conf.labelSpace} y={-6}>{tick.l}</text>
            {:else if conf.location == AxisLocation.END && tick.l}
              <text x={width - conf.labelSpace} y={-6}>{tick.l}</text>
            {/if}
          {/if}
        </g>
      {/each}
    {/if}
  {/if}
{/if}
