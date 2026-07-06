<!-- SPDX-License-Identifier: MPL-2.0 -->

<!--
  Axis labels for the scatter chart, drawn relative to the plot area.
  The Holder reserves margin space (bands) for whichever positions are in use,
  this component only draws the text inside those bands.
-->

<script lang="ts">
  import { ScatterXAxisLabelLocation, ScatterYAxisLabelLocation } from ".";

  interface Props {
    xLabel: { text: string; location: ScatterXAxisLabelLocation };
    yLabel: { text: string; location: ScatterYAxisLabelLocation };
    /** Full drawing width */
    width: number;
    /** Plot area height */
    height: number;
    /** Top edge of the drawing area, relative to the plot */
    top: number;
    /** Bottom edge of the drawing area, relative to the plot */
    bottom: number;
    /** Horizontal center of the plot area */
    centerX: number;
  }

  let { xLabel, yLabel, width, height, top, bottom, centerX }: Props = $props();

  const yIsAbove = $derived(
    yLabel.location == ScatterYAxisLabelLocation.ABOVE_LEFT ||
      yLabel.location == ScatterYAxisLabelLocation.ABOVE_RIGHT,
  );
  const yIsLeft = $derived(
    yLabel.location == ScatterYAxisLabelLocation.ABOVE_LEFT ||
      yLabel.location == ScatterYAxisLabelLocation.BELOW_LEFT,
  );
</script>

{#if xLabel.text != ""}
  <text
    class="axis-title"
    x={centerX}
    y={xLabel.location == ScatterXAxisLabelLocation.ABOVE ? top + 13 : bottom - 6}
    text-anchor="middle"
  >
    {xLabel.text}
  </text>
{/if}

{#if yLabel.text != ""}
  {#if yLabel.location == ScatterYAxisLabelLocation.ROTATED_LEFT}
    <text
      class="axis-title"
      transform="translate(13, {height / 2}) rotate(-90)"
      text-anchor="middle"
    >
      {yLabel.text}
    </text>
  {:else if yLabel.location == ScatterYAxisLabelLocation.ROTATED_RIGHT}
    <text
      class="axis-title"
      transform="translate({width - 13}, {height / 2}) rotate(90)"
      text-anchor="middle"
    >
      {yLabel.text}
    </text>
  {:else}
    <text
      class="axis-title"
      x={yIsLeft ? 0 : width}
      y={yIsAbove ? top + 13 : bottom - 6}
      text-anchor={yIsLeft ? "start" : "end"}
    >
      {yLabel.text}
    </text>
  {/if}
{/if}

<style>
  .axis-title {
    font-size: var(--axis-text-size, 0.9em);
    fill: var(--text-mute-color, #888888);
  }
</style>
