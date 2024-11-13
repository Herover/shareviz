<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { Root, HBar as hBarType } from "$lib/chart";
  import { AxisRepeatMode } from "$lib/chart";
  import { group } from "$lib/utils";
  import HBar from "./HBar.svelte";
  import { formatData } from "./data";

  interface Props {
    chartSpec: Root;
    componentSpec: hBarType;
    data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any[];
  };
    chartWidth: number;
    editor?: boolean;
    index: number;
  }

  let {
    chartSpec,
    componentSpec,
    data,
    chartWidth,
    editor = false,
    index
  }: Props = $props();

  let groups = $derived(formatData(componentSpec, data, componentSpec.colors.byKey));

  let labelOverflows: number[] = $state([]);
  run(() => {
    labelOverflows = labelOverflows.slice(0, groups.length);
  });
  let labelOverflow = $derived(labelOverflows.reduce((acc, n) => Math.max(acc, n), 0));
  let width =
    $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);

  let showAxis = $derived((type: AxisRepeatMode, i: number) => {
    if (type == AxisRepeatMode.ALL) return true;
    else if (type == AxisRepeatMode.FIRST && i == 0) return true;
    else if (type == AxisRepeatMode.LAST && i == group.length - 1) return true;
    return false;
  });
</script>

{#each groups as { k, d }, i}
  <HBar
    {chartSpec}
    hBarSpec={componentSpec}
    labelWidth={componentSpec.labelWidth}
    valueWidth={width - componentSpec.labelWidth - labelOverflow}
    {width}
    values={d}
    label={k}
    showLegend={i == 0}
    showAxisLabels={showAxis(componentSpec.axis.repeat, i)}
    on:labelOverflow={(e) => (labelOverflows[i] = e.detail)}
  />
{/each}
