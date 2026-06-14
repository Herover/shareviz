<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 02 — The Slice: one wedge nudged out of an outlined tortilla. -->

<script lang="ts">
  import { arc } from "d3-shape";
  import type { MarkProps } from "./marks";

  let { size = 36, title }: MarkProps = $props();

  type Empty = Record<string, never>;

  const sliceAngle = Math.PI / 3; // 60° wedge
  const explode = 2.5; // how far the slice is nudged out, in viewBox units

  // Outlined plate: a full disc with the wedge removed.
  const plate = arc<Empty>()
    .innerRadius(0)
    .outerRadius(18)
    .startAngle(sliceAngle)
    .endAngle(2 * Math.PI);
  // The detached wedge itself.
  const slice = arc<Empty>().innerRadius(0).outerRadius(18).startAngle(0).endAngle(sliceAngle);

  // Nudge the slice outward along its bisector (d3 angle 0 = up, clockwise).
  const bisector = sliceAngle / 2;
  const dx = Math.sin(bisector) * explode;
  const dy = -Math.cos(bisector) * explode;

  let sw = $derived(size <= 18 ? 2.4 : size <= 26 ? 2 : 1.75);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 48 48"
  role={title ? "img" : undefined}
  aria-label={title}
  aria-hidden={title ? undefined : "true"}
>
  <g transform="translate(24, 24)">
    <path
      d={plate({}) ?? ""}
      fill="var(--bg-base)"
      stroke="var(--data-cat-1)"
      stroke-width={sw}
      stroke-linejoin="round"
    ></path>
    <path
      transform="translate({dx}, {dy})"
      d={slice({}) ?? ""}
      fill="var(--data-cat-1)"
      stroke="var(--data-cat-1)"
      stroke-width={sw}
      stroke-linejoin="round"
    ></path>
  </g>
</svg>
