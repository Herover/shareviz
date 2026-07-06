<!-- SPDX-License-Identifier: MPL-2.0 -->

<!--
  Places text labels next to points while avoiding overlaps in two dimensions.
  Like AxisLabels.svelte the real label sizes are measured with contentRect, but
  from an invisible copy of every label so measuring is independent of placement.
  Each label greedily tries anchor spots around its point at increasing
  distances, skipping spots that would cover other labels, circles or fall
  outside the bounds. Labels pushed away from their point get a line back to it,
  and labels with no free spot at all only appear when hovering their point.
-->

<script lang="ts">
  interface LabelPoint {
    key: string;
    x: number;
    y: number;
    r: number;
    text: string;
    color: string;
    title: string;
  }

  interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  interface Props {
    /** Labeled points in placement priority order, pixel coordinates */
    items: LabelPoint[];
    /** Circles labels may not cover, including the labeled points themselves */
    obstacles: { x: number; y: number; r: number }[];
    /** Area labels are allowed inside */
    bounds: { x0: number; y0: number; x1: number; y1: number };
  }

  let { items, obstacles, bounds }: Props = $props();

  /** Minimum space between two labels */
  const padding = 2;
  /** Distances between circle edge and label, closest is tried first */
  const gaps = [4, 12, 20, 32];
  /** Labels farther than this from their point always get a leader line */
  const maxUnambiguousGap = 16;

  let sizes: DOMRect[] = $state([]);

  const anchors = [
    "above",
    "below",
    "right",
    "left",
    "above-right",
    "above-left",
    "below-right",
    "below-left",
  ] as const;

  const rectFor = (
    item: LabelPoint,
    w: number,
    h: number,
    anchor: (typeof anchors)[number],
    gap: number,
  ): Rect => {
    const dist = item.r + gap;
    switch (anchor) {
      case "above":
        return { x: item.x - w / 2, y: item.y - dist - h, w, h };
      case "below":
        return { x: item.x - w / 2, y: item.y + dist, w, h };
      case "right":
        return { x: item.x + dist, y: item.y - h / 2, w, h };
      case "left":
        return { x: item.x - dist - w, y: item.y - h / 2, w, h };
      case "above-right":
        return { x: item.x + dist, y: item.y - dist - h, w, h };
      case "above-left":
        return { x: item.x - dist - w, y: item.y - dist - h, w, h };
      case "below-right":
        return { x: item.x + dist, y: item.y + dist, w, h };
      case "below-left":
        return { x: item.x - dist - w, y: item.y + dist, w, h };
    }
  };

  const intersects = (a: Rect, b: Rect) =>
    !(
      a.x + a.w + padding <= b.x ||
      b.x + b.w + padding <= a.x ||
      a.y + a.h + padding <= b.y ||
      b.y + b.h + padding <= a.y
    );

  const inBounds = (rect: Rect) =>
    bounds.x0 <= rect.x &&
    rect.x + rect.w <= bounds.x1 &&
    bounds.y0 <= rect.y &&
    rect.y + rect.h <= bounds.y1;

  let placements = $derived.by(() => {
    const placedRects: Rect[] = [];
    const circleRects: Rect[] = obstacles.map((o) => ({
      x: o.x - o.r,
      y: o.y - o.r,
      w: o.r * 2,
      h: o.r * 2,
    }));

    return items.map((item, i) => {
      const w = sizes[i]?.width ?? item.text.length * 8;
      const h = sizes[i]?.height ?? 15;

      for (let gapIndex = 0; gapIndex < gaps.length; gapIndex++) {
        for (const anchor of anchors) {
          const rect = rectFor(item, w, h, anchor, gaps[gapIndex]);
          if (!inBounds(rect)) continue;
          if (circleRects.some((c) => intersects(rect, c))) continue;
          if (placedRects.some((p) => intersects(rect, p))) continue;

          placedRects.push(rect);
          return {
            item,
            rect,
            hidden: false,
            // A label pushed away from its point is ambiguous, tie it to the point
            leader: gapIndex > 0 || gaps[gapIndex] > maxUnambiguousGap,
          };
        }
      }

      // No free spot, only shown when hovering the point. Kept inside the
      // bounds so it doesn't clip against the chart edges.
      const rect = rectFor(item, w, h, "above", gaps[0]);
      rect.x = Math.min(Math.max(rect.x, bounds.x0), bounds.x1 - rect.w);
      rect.y = Math.min(Math.max(rect.y, bounds.y0), bounds.y1 - rect.h);
      return { item, rect, hidden: true, leader: false };
    });
  });

  // Line from the edge of the circle to the closest edge of the label
  const leaderLine = (p: (typeof placements)[number]) => {
    const lx = Math.min(Math.max(p.item.x, p.rect.x), p.rect.x + p.rect.w);
    const ly = Math.min(Math.max(p.item.y, p.rect.y), p.rect.y + p.rect.h);
    const dx = lx - p.item.x;
    const dy = ly - p.item.y;
    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    return {
      x1: p.item.x + (dx / dist) * (p.item.r + 2),
      y1: p.item.y + (dy / dist) * (p.item.r + 2),
      x2: lx,
      y2: ly,
    };
  };
</script>

<!-- Invisible copies used only for measuring label sizes -->
<g class="scatter-label-measure" aria-hidden="true">
  {#each items as item, i (item.key)}
    <text bind:contentRect={sizes[i]}>{item.text}</text>
  {/each}
</g>

{#each placements as p (p.item.key)}
  {#if p.hidden}
    <g class="scatter-label-hover">
      <circle cx={p.item.x} cy={p.item.y} r={Math.max(p.item.r + 4, 10)} fill="transparent">
        <title>{p.item.title}</title>
      </circle>
      <text
        class="scatter-label scatter-label-hidden"
        fill={p.item.color}
        x={p.rect.x}
        y={p.rect.y + p.rect.h / 2}
        text-anchor="start"
        dominant-baseline="central"
        paint-order="stroke"
        stroke="var(--background-color)"
        stroke-width="3"
      >
        {p.item.text}
      </text>
    </g>
  {:else}
    {#if p.leader}
      {@const line = leaderLine(p)}
      <line
        class="scatter-label-leader"
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={p.item.color}
        stroke-width="1"
      />
    {/if}
    <text
      class="scatter-label"
      fill={p.item.color}
      x={p.rect.x}
      y={p.rect.y + p.rect.h / 2}
      text-anchor="start"
      dominant-baseline="central"
      paint-order="stroke"
      stroke="var(--background-color)"
      stroke-width="3"
    >
      {p.item.text}
    </text>
  {/if}
{/each}

<style>
  .scatter-label,
  .scatter-label-measure text {
    font-size: 0.85em;
  }
  /* Let hovers reach the circles (and their tooltips) underneath */
  .scatter-label,
  .scatter-label-leader {
    pointer-events: none;
  }
  .scatter-label-measure {
    visibility: hidden;
  }
  .scatter-label-hover circle {
    pointer-events: all;
  }
  .scatter-label-hover .scatter-label-hidden {
    display: none;
  }
  .scatter-label-hover:hover .scatter-label-hidden {
    display: unset;
  }
</style>
