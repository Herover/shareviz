<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 01 — Filled tortilla: a six-category donut chart driven by real data. -->

<script lang="ts">
  import { pie, arc, type PieArcDatum } from "d3-shape";
  import { sanitize, type MarkProps } from "./marks";

  // Six equal wedges by default → reproduces the design. Pass `data` for real,
  // uneven category values so it reads as an actual donut chart.
  let { size = 36, data, title }: MarkProps = $props();

  const colors = [
    "--data-cat-1",
    "--data-cat-2",
    "--data-cat-3",
    "--data-cat-4",
    "--data-cat-5",
    "--data-cat-6",
  ];

  const layout = pie<number>()
    .sort(null)
    .value((d) => d);
  const wedge = arc<PieArcDatum<number>>().innerRadius(6).outerRadius(18);

  let arcs = $derived(layout(sanitize(data, [1, 1, 1, 1, 1, 1])));
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
    {#each arcs as a, i (i)}
      <path d={wedge(a) ?? ""} fill="var({colors[i % colors.length]})"></path>
    {/each}
  </g>
</svg>
