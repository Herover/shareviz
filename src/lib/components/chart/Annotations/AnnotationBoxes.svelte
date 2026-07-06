<!-- SPDX-License-Identifier: MPL-2.0 -->

<!--
  Colored zone boxes, rendered inside the chart svg behind the data marks.
  In the editor the whole box can be dragged, and handles resize it: corner
  handles on free boxes, side handles on bands. Drags preview locally in
  pixels and report the final coordinates (in each corner's own unit) through
  onedit, mirroring how FloatingLabel edits reach the editor.
-->

<script lang="ts">
  import {
    AnnotationBoxKind,
    type Annotation,
    type AnnotationBox,
    type AnnotationCoordinate,
    type AnnotationGeometry,
  } from "./annotations";

  interface Props {
    annotations: Annotation[];
    geometry: AnnotationGeometry;
    editor?: boolean;
    /** Fired after a drag with the annotation index and the changed coordinates */
    onedit?: (index: number, changes: { [key: string]: AnnotationCoordinate }) => void;
  }

  let { annotations, geometry, editor = false, onedit = () => {} }: Props = $props();

  let boxes = $derived(
    annotations.reduce<{ a: AnnotationBox; i: number }[]>((acc, a, i) => {
      if (a.type == "box") {
        acc.push({ a, i });
      }
      return acc;
    }, []),
  );

  type CornerKey = "x1" | "x2" | "y1" | "y2";
  type DragMode = "move" | CornerKey | "x1y1" | "x2y1" | "x1y2" | "x2y2";

  // Which stored corner values a drag mode shifts
  const modeKeys: { [mode in DragMode]: CornerKey[] } = {
    move: ["x1", "x2", "y1", "y2"],
    x1: ["x1"],
    x2: ["x2"],
    y1: ["y1"],
    y2: ["y2"],
    x1y1: ["x1", "y1"],
    x2y1: ["x2", "y1"],
    x1y2: ["x1", "y2"],
    x2y2: ["x2", "y2"],
  };

  // Bands ignore the coordinates of the axis they fill
  const activeKeys = (a: AnnotationBox, mode: DragMode): CornerKey[] =>
    modeKeys[mode].filter((k) =>
      a.kind == AnnotationBoxKind.HORIZONTAL_BAND
        ? k == "y1" || k == "y2"
        : a.kind == AnnotationBoxKind.VERTICAL_BAND
          ? k == "x1" || k == "x2"
          : true,
    );

  let drag: { i: number; mode: DragMode; last: [number, number]; d: [number, number] } | null =
    $state(null);

  // Pixel positions of the stored corners, bands take the plot edges
  const pixels = (a: AnnotationBox) => ({
    x1: a.kind == AnnotationBoxKind.HORIZONTAL_BAND ? geometry.plot.x0 : geometry.xToPx(a.x1),
    x2: a.kind == AnnotationBoxKind.HORIZONTAL_BAND ? geometry.plot.x1 : geometry.xToPx(a.x2),
    y1: a.kind == AnnotationBoxKind.VERTICAL_BAND ? geometry.plot.y0 : geometry.yToPx(a.y1),
    y2: a.kind == AnnotationBoxKind.VERTICAL_BAND ? geometry.plot.y1 : geometry.yToPx(a.y2),
  });

  // Corner pixels with the current drag preview applied
  const dragged = (a: AnnotationBox, i: number) => {
    const p = pixels(a);
    if (drag == null || drag.i != i) {
      return p;
    }
    for (const key of activeKeys(a, drag.mode)) {
      p[key] += key == "x1" || key == "x2" ? drag.d[0] : drag.d[1];
    }
    return p;
  };

  const startDrag = (e: MouseEvent, i: number, mode: DragMode) => {
    if (!editor) {
      return;
    }
    e.preventDefault();
    drag = { i, mode, last: [e.clientX, e.clientY], d: [0, 0] };
    addEventListener("mousemove", moveDrag);
    addEventListener("mouseup", stopDrag);
  };
  const moveDrag = (e: MouseEvent) => {
    if (drag) {
      drag.d = [e.clientX - drag.last[0], e.clientY - drag.last[1]];
    }
  };
  const stopDrag = () => {
    removeEventListener("mousemove", moveDrag);
    removeEventListener("mouseup", stopDrag);
    if (drag == null) {
      return;
    }
    const box = boxes.find((b) => b.i == drag?.i);
    if (box) {
      const p = dragged(box.a, box.i);
      const changes: { [key: string]: AnnotationCoordinate } = {};
      for (const key of activeKeys(box.a, drag.mode)) {
        changes[key] =
          key == "x1" || key == "x2"
            ? geometry.pxToX(p[key], box.a[key].unit)
            : geometry.pxToY(p[key], box.a[key].unit);
      }
      onedit(box.i, changes);
    }
    drag = null;
  };

  const handleSize = 8;
  const handles = (a: AnnotationBox, p: ReturnType<typeof pixels>) => {
    if (a.kind == AnnotationBoxKind.FREE) {
      return [
        { x: p.x1, y: p.y1, mode: "x1y1" as DragMode, cursor: "nwse-resize" },
        { x: p.x2, y: p.y1, mode: "x2y1" as DragMode, cursor: "nesw-resize" },
        { x: p.x1, y: p.y2, mode: "x1y2" as DragMode, cursor: "nesw-resize" },
        { x: p.x2, y: p.y2, mode: "x2y2" as DragMode, cursor: "nwse-resize" },
      ];
    }
    if (a.kind == AnnotationBoxKind.VERTICAL_BAND) {
      return [
        { x: p.x1, y: (p.y1 + p.y2) / 2, mode: "x1" as DragMode, cursor: "ew-resize" },
        { x: p.x2, y: (p.y1 + p.y2) / 2, mode: "x2" as DragMode, cursor: "ew-resize" },
      ];
    }
    return [
      { x: (p.x1 + p.x2) / 2, y: p.y1, mode: "y1" as DragMode, cursor: "ns-resize" },
      { x: (p.x1 + p.x2) / 2, y: p.y2, mode: "y2" as DragMode, cursor: "ns-resize" },
    ];
  };
</script>

{#each boxes as { a, i } (a.id)}
  {@const p = dragged(a, i)}
  <g class="annotation-box">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <rect
      x={Math.min(p.x1, p.x2)}
      y={Math.min(p.y1, p.y2)}
      width={Math.abs(p.x2 - p.x1)}
      height={Math.abs(p.y2 - p.y1)}
      fill={a.color.light.c}
      fill-opacity={a.opacity}
      cursor={editor ? (drag?.i == i ? "grabbing" : "grab") : null}
      onmousedown={(e) => startDrag(e, i, "move")}
    />
    {#if editor}
      {#each handles(a, p) as handle (handle.mode)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <rect
          class="annotation-box-handle"
          x={handle.x - handleSize / 2}
          y={handle.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="var(--background-color)"
          stroke={a.color.light.c}
          cursor={handle.cursor}
          onmousedown={(e) => startDrag(e, i, handle.mode)}
        />
      {/each}
    {/if}
  </g>
{/each}
