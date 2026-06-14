<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 05 — Stacked fillings: a stacked-bar chart clipped inside the tortilla. -->

<script lang="ts">
  import { scaleLinear } from "d3-scale";
  import { sanitize, type MarkProps } from "./marks";

  // Defaults reproduce the design's four bands. Pass `data` to vary the band
  // heights so it reads as real stacked data.
  let { size = 36, data, title }: MarkProps = $props();

  const colors = [
    "--data-cat-1",
    "--data-cat-3",
    "--data-cat-4",
    "--data-cat-2",
    "--data-cat-5",
    "--data-cat-6",
  ];
  // The tortilla circle spans y = 6 … 42 (centre 24, radius 18).
  const top = 6;
  const bottom = 42;

  // Unique clip id so multiple instances on a page don't collide.
  const clipId = `stack-clip-${Math.random().toString(36).slice(2, 9)}`;

  let bands = $derived.by(() => {
    const vals = sanitize(data, [10, 9, 8, 9]);
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const y = scaleLinear().domain([0, total]).range([top, bottom]);
    let prefix = 0;
    return vals.map((v, i) => {
      const yStart = y(prefix);
      prefix += v;
      return { y: yStart, height: y(prefix) - yStart, color: colors[i % colors.length] };
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
  <defs>
    <clipPath id={clipId}>
      <circle cx="24" cy="24" r="18" />
    </clipPath>
  </defs>
  <g clip-path="url(#{clipId})">
    {#each bands as b, i (i)}
      <rect x="0" y={b.y} width="48" height={b.height} fill="var({b.color})" />
    {/each}
  </g>
  <circle
    cx="24"
    cy="24"
    r="18"
    fill="none"
    stroke="var(--fg-primary)"
    stroke-width="1.25"
    stroke-opacity="0.18"
  />
</svg>
