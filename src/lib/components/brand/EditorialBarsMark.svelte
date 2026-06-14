<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 06 — Editorial bars: a column chart driven by real data. -->

<script lang="ts">
  import { scaleLinear } from "d3-scale";
  import { max } from "d3-array";
  import { sanitize, type MarkProps } from "./marks";

  // Defaults reproduce the design (third bar dips so it reads as real data).
  // Pass `data` for live values; the bars distribute evenly across the width.
  let { size = 36, data, title }: MarkProps = $props();

  const colors = [
    "--data-cat-1",
    "--data-cat-3",
    "--data-cat-2",
    "--data-cat-4",
    "--data-cat-5",
    "--data-cat-6",
  ];
  const left = 7;
  const right = 41;
  const baseline = 42;
  const maxHeight = 32;
  const gap = 3;

  let bars = $derived.by(() => {
    const vals = sanitize(data, [12, 22, 18, 32]);
    const peak = max(vals) || 1;
    const h = scaleLinear().domain([0, peak]).range([0, maxHeight]);
    const width = (right - left - gap * (vals.length - 1)) / vals.length;
    return vals.map((v, i) => {
      const height = h(v);
      return {
        x: left + i * (width + gap),
        y: baseline - height,
        width,
        height,
        color: colors[i % colors.length],
      };
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
  {#each bars as b, i (i)}
    <rect x={b.x} y={b.y} width={b.width} height={b.height} fill="var({b.color})" />
  {/each}
</svg>
