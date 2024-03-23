<script lang="ts">
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import { formatNumber } from "$lib/utils";
  import { createEventDispatcher, onMount } from "svelte";

  export let labelWidth: number;
  export let valueWidth: number;
  export let values: {
    label: string;
    value: { label: string; value: number }[];
  }[];

  const dispatch = createEventDispatcher();

  const valueHeight = 20;
  const barMargin = 0;
  const blockMargin = 16;
  const scaleHeight = 16;
  let legendHeight = 24;

  const bars =
    values.length != 0 && values[0].value.length != 0
      ? values[0].value.length
      : 0;
  const barHeight = valueHeight - barMargin * 2;
  const blockHeight = valueHeight * bars;

  $: valueScale = scaleLinear()
    .range([0, valueWidth])
    .domain([
      0,
      values.reduce(
        (val, newVal) =>
          Math.max(
            val,
            newVal.value.reduce(
              (val, newVal) => Math.max(val, newVal.value),
              0,
            ),
          ),
        1,
      ),
    ]);
  $: color = scaleOrdinal<string>()
    .domain(
      values.length != 0 && values[0].value.length != 0
        ? values[0].value.map((d) => d.label)
        : [],
    )
    .range(["#ff8888", "#aa2222"]);

  onMount(() =>
    dispatch("size", {
      height:
        (blockHeight + blockMargin) * values.length -
        blockMargin +
        // bars * barMargin +
        legendHeight +
        scaleHeight,
    }),
  );
  $: dispatch("size", {
    height:
      (blockHeight + blockMargin) * values.length -
      blockMargin +
      // bars * barMargin +
      legendHeight +
      scaleHeight,
  });
</script>

{#if legendHeight != 0}
  <g transform="translate({0},{0})">
    {#each color.domain().map((d) => ({ k: d, c: color(d) })) as d, i}
      <rect x={i * 80} y={0} width={16} height={15} fill={d.c || ""} />
      <text x={i * 80 + 24} dominant-baseline="hanging">{d.k}</text>
    {/each}
  </g>
{/if}

<g transform="translate({labelWidth},{legendHeight})">
  <!-- <path d="m 0,0 l {valueWidth},0" stroke="black" stroke-width="1" /> -->

  {#each valueScale.ticks(4) as tick}
    <path
      d="m {valueScale(tick)},{scaleHeight} l 0,{(blockHeight + blockMargin) *
        values.length -
        blockMargin}"
      stroke="#aaaaaa"
      stroke-width="1"
    />
    <text
      text-anchor="middle"
      dominant-baseline="hanging"
      font-size={scaleHeight}
      x={valueScale(tick)}>{formatNumber(tick)}</text
    >
  {/each}
</g>

<g transform="translate({0},{scaleHeight + legendHeight})">
  {#each values as d, i}
    <g transform="translate({0},{i * (blockHeight + blockMargin)})">
      <text
        x={0}
        y={blockHeight / 2}
        dominant-baseline="middle"
        text-anchor="start">{d.label}</text
      >

      {#each d.value as dd, ii}
        <rect
          x={labelWidth}
          y={ii * valueHeight + barMargin}
          height={barHeight}
          width={valueScale(dd.value)}
          fill={color(dd.label)}
        >
          <title>{dd.label}: {dd.value}</title>
        </rect>
      {/each}
    </g>
  {/each}
</g>
