<script lang="ts">
  import { LabelStyleLine, type LineStyleKey } from "$lib/chart";
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import { createEventDispatcher } from "svelte";

  export let lines: LineStyleKey[];
  export let xScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let yScale:
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
  export let editor = false;

  const dispatch = createEventDispatcher<{
    edit: any[];
  }>();

  let lastMovePos = [0, 0];
  let relativeMove = [0, 0];
  let moving = -1;
  const startMove = (
    i: number,
    e: MouseEvent & { currentTarget: EventTarget & SVGGElement },
  ) => {
    if (editor) {
      lastMovePos = [e.clientX, e.clientY];
      moving = i;
      addEventListener("mousemove", move);
      addEventListener("mouseup", stopMove);
    }
  };
  const stopMove = (e: MouseEvent) => {
    if (editor) {
      dispatch("edit", [
        moving,
        "labelRelativePos",
        [
          lines[moving].label.rx + e.clientX - lastMovePos[0],
          lines[moving].label.ry + e.clientY - lastMovePos[1],
        ],
      ]);
      lastMovePos = [e.clientX, e.clientY];
      relativeMove = [0, 0];
      moving = -1;
      removeEventListener("mousemove", move);
      removeEventListener("mouseup", stopMove);
    }
  };
  const move = (e: MouseEvent) => {
    if (editor && moving !== -1) {
      relativeMove = [e.clientX - lastMovePos[0], e.clientY - lastMovePos[1]];
    }
  };

  const boxes: { width: number; height: number }[] = [];
</script>

{#each lines as line, i}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <g
    transform="translate({xScale(line.label.x)}, {yScale(line.label.y)})"
    on:mousedown={(e) => startMove(i, e)}
  >
    <text
      x={line.label.rx + (moving == i ? relativeMove[0] : 0)}
      y={line.label.ry - 8 + (moving == i ? relativeMove[1] : 0)}
      fill={line.color}
      bind:contentRect={boxes[i]}
      cursor={moving == i ? "grabbing" : "grab"}
      paint-order="stroke"
      stroke="#ffffff"
      stroke-width="3"
      text-anchor="middle">{line.label.text}</text
    >
    {#if line.label.line == LabelStyleLine.Line}
      {#if line.label.ry < 0}
        <line
          x2={line.label.rx}
          y2={line.label.ry}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {:else if line.label.ry > boxes[i]?.height}
        <line
          x2={line.label.rx}
          y2={line.label.ry - boxes[i]?.height - 8}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {:else if line.label.rx < 0}
        <line
          x2={line.label.rx + boxes[i]?.width / 2 + 8}
          y2={line.label.ry - boxes[i]?.height / 2}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {:else if line.label.rx > 0}
        <line
          x2={line.label.rx - boxes[i]?.width / 2 - 8}
          y2={line.label.ry - boxes[i]?.height / 2}
          stroke="#000000"
          stroke-width={2}
          stroke-linecap="round"
        />
      {/if}
    {/if}
  </g>
{/each}
