<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 04 — Sunburst: concentric data-color rings sized from real data. -->

<script lang="ts">
  import { scaleLinear } from "d3-scale";
  import { sanitize, type MarkProps } from "./marks";

  // Three equal rings by default → reproduces the design. Pass `data` to size
  // the ring thicknesses from real values; extra values cycle the palette.
  let { size = 36, data, title }: MarkProps = $props();

  const colors = [
    "--data-cat-1",
    "--data-cat-3",
    "--data-cat-2",
    "--data-cat-4",
    "--data-cat-5",
    "--data-cat-6",
  ];
  const maxRadius = 20;
  const holeRadius = 5;

  // Draw nested filled discs from the outside in; each one paints over the
  // previous, leaving rings whose thickness is proportional to the data.
  let discs = $derived.by(() => {
    const vals = sanitize(data, [1, 1, 1]);
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const r = scaleLinear().domain([0, total]).range([holeRadius, maxRadius]);
    let prefix = 0;
    return vals.map((v, i) => {
      const radius = r(total - prefix);
      prefix += v;
      return { radius, color: colors[i % colors.length] };
    });
  });
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 48 48"
  role={title ? "img" : undefined}
  aria-label={title}
  aria-hidden={title ? undefined : "true"}
>
  {#each discs as d, i (i)}
    <circle cx="24" cy="24" r={d.radius} fill="var({d.color})" />
  {/each}
  <circle cx="24" cy="24" r={holeRadius} fill="var(--bg-base)" />
</svg>
