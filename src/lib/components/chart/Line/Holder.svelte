<script lang="ts">
  import type { Root, Line as lineType } from "$lib/chart";
  import Line from "./Line.svelte";
  import { formatData } from "./data";

  export let chartSpec: Root;
  export let componentSpec: lineType;
  export let data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any[];
  };
  export let chartWidth: number;
  export let editor = false;
</script>

<Line
  {chartSpec}
  lineSpec={componentSpec}
  values={formatData(componentSpec, data)}
  width={chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight}
  {editor}
  on:edit
/>
