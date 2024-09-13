<script lang="ts">
  import type { Axis, HBar } from "$lib/chart";
  import { formatNumber } from "$lib/utils";
  import chroma from "chroma-js";

  export let x: number;
  export let y: number;
  export let height: number;
  export let width: number;
  export let barHeight: number;
  export let fill: string;
  export let label: string;
  export let value: number;
  export let axis: Axis;
  export let conf: HBar;

  let textBox: DOMRect | undefined;
  $: offset = textBox ? barHeight - textBox.height : 0;
  $: display = textBox ? textBox.width + offset * 2 < width : true;

  let textColor = "#000000";
  $: {
    try {
      // TODO: Examine if other difference functions work better here, ex. .distance, .contrast
      // or .contrastAPCA
      textColor =
        chroma.deltaE(fill, "#000000") > chroma.deltaE(fill, "#ffffff")
          ? "#000000"
          : "#ffffff";
    } catch (e) {
      // A error will usually be thrown if the user is manually editing the fill color
      console.warn(e);
    }
  }
</script>

<rect {x} {y} {height} {width} {fill}>
  <title>{label}: {value}</title>
</rect>
{#if conf.rectLabels}
  <text
    bind:contentRect={textBox}
    x={x + width - offset}
    y={y + barHeight / 2}
    opacity={display ? null : 0}
    aria-hidden={display ? null : true}
    fill={textColor}
    text-anchor="end"
    dominant-baseline="middle"
  >
    {formatNumber(value, axis.major.labelDivide, axis.major.labelThousands)}
  </text>
{/if}
