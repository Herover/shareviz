<script lang="ts">
  import { HBarTotalLabelStyle, type HBar } from "$lib/chart";
  import { createEventDispatcher } from "svelte";
  import HBarRect from "./HBarRect.svelte";
  import { formatNumber } from "$lib/utils";

  export let conf: HBar;
  export let i: number;
  export let d: {
    label: string;
    value: {
      label: string;
      value: number;
      from: number;
      to: number;
    }[];
  };
  export let blockHeight: number;
  export let blockMargin: number;
  export let barMargin: number;
  export let barHeight: number;
  export let labelWidth: number;
  export let valueHeight: number;
  export let valueScale: (d: any) => number;
  export let color: (d: any) => string;

  const spacing = 2;

  const dispatch = createEventDispatcher<{
    labelOverflow: number;
  }>();

  let outsideLabelBox: DOMRect | undefined;
  $: if (
    conf.totalLabels == HBarTotalLabelStyle.OUTSIDE &&
    typeof outsideLabelBox != "undefined"
  ) {
    dispatch("labelOverflow", outsideLabelBox.width + spacing);
  } else {
    dispatch("labelOverflow", 0);
  }
</script>

<g transform="translate({0},{i * (blockHeight + blockMargin)})">
  <text x={0} y={blockHeight / 2} dominant-baseline="middle" text-anchor="start"
    >{d.label}</text
  >

  {#each d.value as dd, ii}
    <HBarRect
      {conf}
      x={labelWidth + valueScale(dd.from)}
      y={(conf.stackSubCategories ? 0 : ii) * valueHeight + barMargin}
      height={barHeight}
      width={valueScale(dd.to - dd.from)}
      fill={color(dd.label != "" ? dd : d)}
      label={dd.label}
      value={dd.value}
      {barHeight}
      axis={conf.axis}
    />
    {#if conf.totalLabels == HBarTotalLabelStyle.OUTSIDE && ii == d.value.length - 1}
      <text
        bind:contentRect={outsideLabelBox}
        x={labelWidth + valueScale(dd.to) + spacing}
        y={(conf.stackSubCategories ? 0 : ii) * valueHeight +
          barMargin +
          barHeight / 2}
        dominant-baseline="middle"
      >
        {formatNumber(
          d.value[d.value.length - 1].to,
          conf.axis.major.labelDivide,
          conf.axis.major.labelThousands,
        )}
      </text>
    {/if}
  {/each}
</g>
