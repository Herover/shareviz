<script lang="ts">
  import type { Axis, HBar } from "$lib/chart";
  import { formatNumber } from "$lib/utils";
  import chroma from "chroma-js";

  interface Props {
    x: number;
    y: number;
    height: number;
    width: number;
    barHeight: number;
    fill: string;
    label: string;
    value: number;
    axis: Axis;
    conf: HBar;
  }

  let { x, y, height, width, barHeight, fill, label, value, axis, conf }: Props = $props();

  let textBox: DOMRect | undefined = $state();
  let offset = $derived(textBox ? barHeight - textBox.height : 0);
  let display = $derived(textBox ? textBox.width + offset * 2 < width : true);

  let textColor = $state("#000000");
  $effect(() => {
    try {
      // TODO: Examine if other difference functions work better here, ex. .distance, .contrast
      // or .contrastAPCA
      textColor =
        chroma.deltaE(fill, "#000000") > chroma.deltaE(fill, "#ffffff") ? "#000000" : "#ffffff";
    } catch (e) {
      // A error will usually be thrown if the user is manually editing the fill color
      console.warn(e);
    }
  });
</script>

<rect {x} {y} {height} {width} fill={chroma(fill).hex()}>
  <title>{label}: {value}</title>
</rect>
{#if conf.rectLabels}
  <text
    bind:contentRect={textBox}
    x={x + width - offset}
    y={y + barHeight / 2}
    opacity={display ? null : 0}
    aria-hidden={display ? null : true}
    cursor={display ? null : "default"}
    fill={textColor}
    text-anchor="end"
    dominant-baseline="middle"
  >
    {formatNumber(value, axis.major.labelDivide, axis.major.labelThousands)}
  </text>
{/if}
