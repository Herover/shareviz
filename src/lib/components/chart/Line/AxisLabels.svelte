<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  interface Props {
    align: "left" | "right";
    x: number;
    items: {
      y: number;
      text: string;
      color: string;
      key: string;
    }[];
  }

  let { items, align, x }: Props = $props();

  let heights: DOMRect[] = $state([]);
  let heights2: DOMRect[] = $derived(heights.slice(0, items.length ?? 0));
  let yPositions = $derived(
    heights2.reduce<{ key: string; y: number; y2: number }[]>((acc, d, i) => {
      const y = Math.max(i == 0 ? 0 : acc[i - 1].y2, items[i]?.y ?? 0);
      acc.push({
        key: items[i].key,
        y,
        y2: y + d.height,
      });

      return acc;
    }, []),
  );
</script>

{#each items as item, i (item.key)}
  <text
    fill={item.color}
    {x}
    y={yPositions[i]?.y ?? 0}
    text-anchor={align == "left" ? "start" : "end"}
    paint-order="stroke"
    stroke="var(--background-color)"
    stroke-width={3}
    dominant-baseline="middle"
    bind:contentRect={heights[i]}
  >
    {item.text}
  </text>
{/each}
