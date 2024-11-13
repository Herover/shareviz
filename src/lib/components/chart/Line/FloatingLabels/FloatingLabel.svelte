<script lang="ts">
  import { LabelStyleLine, type LineStyleKey } from "$lib/chart";
  import type { ScaleLinear, ScaleTime } from "d3-scale";
  import { createEventDispatcher } from "svelte";

  interface Props {
    line: LineStyleKey;
    xScale: 
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
    yScale: 
    | ScaleLinear<number, number, never>
    | ScaleTime<number, number, never>;
    editor?: boolean;
  }

  let {
    line,
    xScale,
    yScale,
    editor = false
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    edit: any[];
  }>();

  let lastMovePos = [0, 0];
  let relativeMove = $state([0, 0]);
  let moving = $state(false);
  const startMove = (
    e: MouseEvent & { currentTarget: EventTarget & SVGGElement },
  ) => {
    if (editor) {
      lastMovePos = [e.clientX, e.clientY];
      moving = true;
      addEventListener("mousemove", move);
      addEventListener("mouseup", stopMove);
    }
  };
  const stopMove = (e: MouseEvent) => {
    if (editor) {
      dispatch("edit", [
        "labelRelativePos",
        [
          line.label.rx + e.clientX - lastMovePos[0],
          line.label.ry + e.clientY - lastMovePos[1],
        ],
      ]);
      lastMovePos = [e.clientX, e.clientY];
      relativeMove = [0, 0];
      moving = false;
      removeEventListener("mousemove", move);
      removeEventListener("mouseup", stopMove);
    }
  };
  const move = (e: MouseEvent) => {
    if (editor && moving) {
      relativeMove = [e.clientX - lastMovePos[0], e.clientY - lastMovePos[1]];
    }
  };

  let box: { width: number; height: number } = $state();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g
  transform="translate({xScale(
    typeof line.label.x == 'string' ? new Date(line.label.x) : line.label.x,
  )}, {yScale(line.label.y)})"
  onmousedown={(e) => startMove(e)}
>
  <text
    x={line.label.rx + (moving ? relativeMove[0] : 0)}
    y={line.label.ry - 8 + (moving ? relativeMove[1] : 0)}
    fill={line.color}
    bind:contentRect={box}
    cursor={moving ? "grabbing" : "grab"}
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
    {:else if line.label.ry > box?.height}
      <line
        x2={line.label.rx}
        y2={line.label.ry - box?.height - 8}
        stroke="#000000"
        stroke-width={2}
        stroke-linecap="round"
      />
    {:else if line.label.rx < 0}
      <line
        x2={line.label.rx + box?.width / 2 + 8}
        y2={line.label.ry - box?.height / 2}
        stroke="#000000"
        stroke-width={2}
        stroke-linecap="round"
      />
    {:else if line.label.rx > 0}
      <line
        x2={line.label.rx - box?.width / 2 - 8}
        y2={line.label.ry - box?.height / 2}
        stroke="#000000"
        stroke-width={2}
        stroke-linecap="round"
      />
    {/if}
  {/if}
</g>
