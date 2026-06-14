<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 07 — Composition: an asymmetric dashboard tile grid. -->

<script lang="ts">
  import type { MarkProps } from "./marks";

  let { size = 36, title }: MarkProps = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 48 48"
  role={title ? "img" : undefined}
  aria-label={title}
  aria-hidden={title ? undefined : "true"}
>
  <rect x="6" y="6" width="22" height="22" fill="var(--data-cat-1)" />
  <rect x="30" y="6" width="12" height="22" fill="var(--data-cat-2)" />
  <rect x="6" y="30" width="22" height="12" fill="var(--data-cat-3)" />
  <rect x="30" y="30" width="12" height="12" fill="var(--data-cat-4)" />
</svg>
