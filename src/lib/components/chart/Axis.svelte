<script lang="ts" context="module">
  export interface GridConf {
    major: AxisConf;
    minor: AxisConf;
    location: AxisLocation;
    orientation: AxisOrientation;
  }
  export interface AxisConf {
    grid: boolean;
    enabled: boolean;
    tickSize: number;
    color: string;
    ticks: {
      n: number;
      l: string;
    }[];
    auto: {
      from: number;
      each: number;
      labels: true;
    };
  }
  export enum AxisLocation {
    NONE = "none",
    START = "start",
    END = "end",
  }
  export enum AxisOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
  }
</script>

<script lang="ts">
  import type { ScaleContinuousNumeric } from "d3-scale";
  import { formatNumber } from "$lib/utils";

  export let conf: GridConf;
  /* export let width: number; */
  export let height: number;
  export let scale: ScaleContinuousNumeric<number, number> | undefined;

  let size = 16;
  let lineOffset = conf.location == AxisLocation.START ? size : 0;
  const maxTicks = 200;

  let autoMajorTicks: { n: number; l: string }[] = [];
  $: {
    if (conf && scale) {
      autoMajorTicks = [];
      const to = scale.domain()[1];
      const expectedTicks =
        1 + (to - conf.major.auto.from) / conf.major.auto.each;
      if (expectedTicks > maxTicks) {
        autoMajorTicks = [
          { n: scale.domain()[0], l: `Too many ticks (${expectedTicks})` },
        ];
      } else {
        for (let i = conf.major.auto.from; i <= to; i += conf.major.auto.each) {
          autoMajorTicks.push({ n: i, l: formatNumber(i) });
        }
      }
    }
  }
  $: majorTicks = conf && scale ? [...conf.major.ticks, ...autoMajorTicks] : [];

  let autoMinorTicks: { n: number; l: string }[] = [];
  $: {
    if (conf && scale) {
      autoMinorTicks = [];
      const to = scale.domain()[1];
      const expectedTicks =
        1 + (to - conf.minor.auto.from) / conf.minor.auto.each;
      if (expectedTicks > maxTicks) {
        autoMinorTicks = [
          { n: scale.domain()[0], l: `Too many ticks (${expectedTicks})` },
        ];
      } else {
        for (let i = conf.minor.auto.from; i <= to; i += conf.minor.auto.each) {
          autoMinorTicks.push({ n: i, l: formatNumber(i) });
        }
      }
    }
  }
  $: minorTicks = conf && scale ? [...conf.minor.ticks, ...autoMinorTicks] : [];
  $: console.log(autoMinorTicks, autoMajorTicks);
</script>

{#if conf && scale}
  {#if conf.orientation == AxisOrientation.VERTICAL}
    {#if conf.minor.enabled}
      {#each minorTicks as tick}
        <path
          d="m {scale(tick.n)},{lineOffset} l 0,{conf.minor.grid ? height : conf.minor.tickSize}"
          stroke={conf.minor.color}
          stroke-width="1"
        />
      {/each}
    {/if}

    {#if conf.major.enabled}
      {#each majorTicks as tick}
        <path
          d="m {scale(tick.n)},{lineOffset} l 0,{conf.major.grid ? height : conf.major.tickSize}"
          stroke={conf.major.color}
          stroke-width="1"
        />
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
      {/each}
    {/if}
  <!-- {:else} -->
  {/if}
{/if}
