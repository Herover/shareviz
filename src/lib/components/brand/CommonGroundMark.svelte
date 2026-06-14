<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 03 — Common ground: three overlapping rings with a shared pin. -->

<script lang="ts">
  import type { MarkProps } from "./marks";

  let { size = 36, title }: MarkProps = $props();

  // Rings need extra weight as the mark shrinks so the overlap stays legible.
  let sw = $derived(size <= 18 ? 2.5 : size <= 26 ? 2 : 1.75);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 48 48"
  fill="none"
  role={title ? "img" : undefined}
  aria-label={title}
  aria-hidden={title ? undefined : "true"}
>
  <circle cx="24" cy="18" r="11" stroke="var(--data-cat-1)" stroke-width={sw} />
  <circle cx="18.5" cy="28" r="11" stroke="var(--data-cat-2)" stroke-width={sw} />
  <circle cx="29.5" cy="28" r="11" stroke="var(--data-cat-3)" stroke-width={sw} />
  <circle cx="24" cy="24.7" r="2.25" fill="var(--fg-primary)" />
</svg>
