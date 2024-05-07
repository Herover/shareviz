<script lang="ts">
  import type { Root, Line as lineType } from "$lib/chart";
  import { group } from "$lib/utils";
  import Line from "./Line.svelte";

  export let chartSpec: Root;
  export let componentSpec: lineType;
  export let data: {
    [key: string]: any[];
  };
  export let chartWidth: number;
</script>

<Line
  {chartSpec}
  lineSpec={componentSpec}
  values={group(
    componentSpec.categories,
    data[componentSpec.dataSet],
    (k, g) => ({
      label: k,
      value: g.map((d) => ({
        x: d[componentSpec.x.key],
        y: d[componentSpec.y.key],
      })),
    }),
  )}
  width={chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight}
/>
