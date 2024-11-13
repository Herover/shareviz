<script lang="ts">
  import type { Root, Line as lineType } from "$lib/chart";
  import Line from "./Line.svelte";
  import { formatData } from "./data";

  interface Props {
    chartSpec: Root;
    componentSpec: lineType;
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
</script>

<Line
  {chartSpec}
  lineSpec={componentSpec}
  values={formatData(componentSpec, data)}
  width={chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight}
  {editor}
  {index}
  on:edit
/>
