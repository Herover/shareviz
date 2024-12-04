<script lang="ts">
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import { formatNumber, orDefault, orNumber } from "$lib/utils";
  import type { Axis } from "$lib/chart";
  import { AxisLocation, AxisOrientation } from "$lib/chart";

  interface Props {
    conf: Axis;
    width: number;
    height: number;
    scale: ScaleLinear<number, number, never> | ScaleTime<number, number, never> | undefined;
    showLabels?: boolean;
    dimensions?: (d: {
      width: number,
      height: number,
      leftOverflow?: number,
      rightOverflow?: number,
      labelHeight: number,
    }) => void,
  }

  let {
    conf,
    width,
    height,
    scale,
    showLabels = true,
    dimensions = () => {},
  }: Props = $props();

  let size = 4;
  const maxTicks = 200;

  let labelBox: DOMRect | undefined = $state();
  let leftBox: DOMRect | undefined = $state();
  let rightBox: DOMRect | undefined = $state();
  let testBox: DOMRect | undefined = $state();

  let autoMajorTicks: { n: number | Date; l: string }[] = $state([]);
  let manualMajorTicks: {
    n: number;
    l: string;
  }[] = $state([]);

  let autoMinorTicks: { n: number | Date; l: string }[] = $state([]);
  let manualMinorTicks: {
    n: number;
    l: string;
  }[] = $state([]);
  let lineOffset = $derived(showLabels && conf.location == AxisLocation.START ? size : 0);
  $effect(() => {
    if (scale && conf.major.enabled && conf.major.auto.each != 0) {
      // Note: we are not allowed to assign these two variables to new values after this, or we
      // get a weird reactive loop when we access it in the reactive block that dispatch stuff.
      let computedMajorTicks: typeof autoMajorTicks = [];
      let computedManualMajorTicks: typeof manualMajorTicks = [];
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        const customFrom = Math.max(Math.min(conf.major.auto.from, to), from);
        const expectedTicks =
          1 + (to - customFrom) / conf.major.auto.each;
        if (expectedTicks > maxTicks) {
          computedMajorTicks = [
            { n: from, l: `Too many ticks (${expectedTicks})` },
          ];
        } else {
          for (let i = customFrom; i <= to; i += conf.major.auto.each) {
            computedMajorTicks.push({
              n: i,
              l: conf.major.auto.labels ? formatNumber(
                i,
                conf.major.labelDivide,
                conf.major.labelThousands,
              ) + conf.major.afterLabel : "",
            });
          }
        }
        computedManualMajorTicks = conf.major.ticks.filter(d => d.n <= to && customFrom <= d.n);
      } else if (to instanceof Date && from instanceof Date) {
        let d = new Date(from);
        d.setDate(1);
        d.setMonth(0);
        let n = 0;
        while (d <= to && n < maxTicks) {
          computedMajorTicks.push({
            n: new Date(d),
            l: conf.major.auto.labels ? d.getFullYear() + conf.major.afterLabel : "",
          });
          d.setFullYear(d.getFullYear() + conf.major.auto.each);
          n++;
        }
      }
      autoMajorTicks = computedMajorTicks;
      manualMajorTicks = computedManualMajorTicks;
    }
  });
  let majorTicks = $derived(
    scale
      ? [...manualMajorTicks, ...autoMajorTicks].sort((a, b) =>
          a.n instanceof Date && b.n instanceof Date
            ? a.n.getTime() - b.n.getTime()
            : typeof a.n == "number" && typeof b.n == "number"
              ? a.n - b.n
              : 0,
        )
      : [],
  );
  $effect(() => {
    if (labelBox || leftBox || rightBox) dimensions({
      width: orNumber(labelBox?.width, 0) + conf.labelSpace,
      height: orNumber(labelBox?.height, 0),
      labelHeight: orNumber(testBox?.height, 0) + conf.major.tickSize + size,
    });
  });
  $effect(() => {
    if (scale && conf.minor.enabled && conf.minor.auto.each != 0) {
      let computedMinorTicks: typeof autoMinorTicks = [];
      const from = scale.domain()[0];
      const to = scale.domain()[1];
      if (typeof to == "number" && typeof from == "number") {
        const expectedTicks =
          1 + (to - conf.minor.auto.from) / conf.minor.auto.each;
        if (expectedTicks > maxTicks) {
          computedMinorTicks = [
            { n: from, l: `Too many ticks (${expectedTicks})` },
          ];
        } else {
          for (let i = conf.minor.auto.from; i <= to; i += conf.minor.auto.each) {
            computedMinorTicks.push({
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
          computedMinorTicks.push({
            n: new Date(d),
            l: conf.minor.auto.labels ? d.getFullYear() + conf.minor.afterLabel : "",
          });
          d.setFullYear(d.getFullYear() + conf.minor.auto.each);
          n++;
        }
      }
      
      autoMinorTicks = computedMinorTicks;
    }
  });
  let minorTicks = $derived(scale
    ? [...manualMinorTicks, ...autoMinorTicks].filter(
        (d) => !majorTicks.find((dd) => dd.l != "" && dd.n == d.n),
      )
    : []);
</script>

<text bind:contentRect={testBox} aria-hidden="true" visibility="hidden">123</text>
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
              x={scale(tick.n)}>{tick.l}</text
            >
          {:else if conf.location == AxisLocation.END && tick.l}
            <text
              dominant-baseline="hanging"
              y={height + conf.major.tickSize + size}
              x={scale(tick.n)}>{tick.l}</text
            >
          {/if}

          <!-- Used to calculate labels overflowing outside of chart area -->
          {#if i == 0}
            <text
              text-anchor="middle"
              bind:contentRect={leftBox}
              x={scale(tick.n)}
              visibility="hidden"
              aria-hidden="true">{tick.l}</text
            >
          {:else if i == majorTicks.length - 1}
            <text
              text-anchor="middle"
              bind:contentRect={rightBox}
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
        {#each majorTicks as tick, i}
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

<style>
  text {
    font-size: var(--axis-text-size);
  }
</style>
