<!-- SPDX-License-Identifier: MPL-2.0 -->

<!--
  Rich-text annotations. These are HTML (DeltaView) so they live in an overlay
  positioned on top of the chart svg, the chart must wrap both in a
  position: relative container. The coordinate is the block's top left corner.
  In the editor blocks can be dragged, the final position is reported through
  onedit in the annotation's own units.
-->

<script lang="ts">
  import DeltaView from "../richText/DeltaView.svelte";
  import type {
    Annotation,
    AnnotationCoordinate,
    AnnotationGeometry,
    AnnotationText,
  } from "./annotations";

  interface Props {
    annotations: Annotation[];
    geometry: AnnotationGeometry;
    /** Position of the plot area origin inside the overlay, usually the svg group translate */
    offset: { x: number; y: number };
    editor?: boolean;
    /** Fired after a drag with the annotation index and the changed coordinates */
    onedit?: (index: number, changes: { [key: string]: AnnotationCoordinate }) => void;
  }

  let { annotations, geometry, offset, editor = false, onedit = () => {} }: Props = $props();

  let texts = $derived(
    annotations.reduce<{ a: AnnotationText; i: number }[]>((acc, a, i) => {
      if (a.type == "text") {
        acc.push({ a, i });
      }
      return acc;
    }, []),
  );

  let drag: { i: number; last: [number, number]; d: [number, number] } | null = $state(null);

  const startDrag = (e: MouseEvent, i: number) => {
    if (!editor) {
      return;
    }
    e.preventDefault();
    drag = { i, last: [e.clientX, e.clientY], d: [0, 0] };
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
    const text = texts.find((t) => t.i == drag?.i);
    if (text) {
      onedit(text.i, {
        x: geometry.pxToX(geometry.xToPx(text.a.x) + drag.d[0], text.a.x.unit),
        y: geometry.pxToY(geometry.yToPx(text.a.y) + drag.d[1], text.a.y.unit),
      });
    }
    drag = null;
  };
</script>

<div class="annotation-texts">
  {#each texts as { a, i } (a.id)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="annotation-text"
      class:annotation-text-editor={editor}
      style:left="{geometry.xToPx(a.x) + offset.x + (drag?.i == i ? drag.d[0] : 0)}px"
      style:top="{geometry.yToPx(a.y) + offset.y + (drag?.i == i ? drag.d[1] : 0)}px"
      style:width="{(a.width / 100) * (geometry.plot.x1 - geometry.plot.x0)}px"
      style:cursor={editor ? (drag?.i == i ? "grabbing" : "grab") : null}
      onmousedown={(e) => startDrag(e, i)}
    >
      <DeltaView delta={a.text} defaultBlock="p" />
    </div>
  {/each}
</div>

<style>
  .annotation-texts {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .annotation-text {
    position: absolute;
    pointer-events: auto;
  }
  .annotation-text-editor {
    user-select: none;
  }
  .annotation-text :global(p),
  .annotation-text :global(h1),
  .annotation-text :global(h2) {
    margin: 0;
  }
</style>
