<script lang="ts">
  import { HBarTotalLabelStyle, type HBar } from "$lib/chart";
  import HBarRect from "./HBarRect.svelte";
  import { formatNumber } from "$lib/utils";

  interface Props {
    conf: HBar;
    i: number;
    d: {
      label: string;
      value: {
        label: string;
        value: number;
        from: number;
        to: number;
      }[];
    };
    blockHeight: number;
    blockMargin: number;
    barMargin: number;
    barHeight: number;
    labelWidth: number;
    valueHeight: number;
    valueScale: (d: any) => number;
    color: (d: any) => string;
    labelOverflow: (overflow: number) => void;
  }

  let {
    conf,
    i,
    d,
    blockHeight,
    blockMargin,
    barMargin,
    barHeight,
    labelWidth,
    valueHeight,
    valueScale,
    color,
    labelOverflow = () => {},
  }: Props = $props();

  const spacing = 2;

  let outsideLabelBox: DOMRect | undefined = $state();
  $effect(() => {
    if (conf.totalLabels == HBarTotalLabelStyle.OUTSIDE && typeof outsideLabelBox != "undefined") {
      labelOverflow(outsideLabelBox.width + spacing);
    } else {
      labelOverflow(0);
    }
  });
</script>

<g transform="translate({0},{i * (blockHeight + blockMargin)})">
  <text x={0} y={blockHeight / 2} dominant-baseline="middle" text-anchor="start">{d.label}</text>

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
    {#if conf.totalLabels == HBarTotalLabelStyle.OUTSIDE && (!conf.stackSubCategories || ii == d.value.length - 1)}
      <text
        bind:contentRect={outsideLabelBox}
        x={labelWidth + valueScale(dd.to) + spacing}
        y={(conf.stackSubCategories ? 0 : ii) * valueHeight + barMargin + barHeight / 2}
        dominant-baseline="middle"
      >
        {formatNumber(
          conf.stackSubCategories ? d.value[d.value.length - 1].to : dd.value,
          conf.axis.major.labelDivide,
          conf.axis.major.labelThousands,
        )}
      </text>
    {/if}
  {/each}
  {#each d.value as dd, ii}
    <rect
      x={labelWidth + valueScale(dd.from)}
      y={(conf.stackSubCategories ? 0 : ii) * valueHeight + barMargin}
      height={barHeight}
      width={valueScale(dd.to - dd.from)}
      fill="transparent"
    >
      <title>{dd.label}: {dd.value}</title>
    </rect>
  {/each}
</g>
