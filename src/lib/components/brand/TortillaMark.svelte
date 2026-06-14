<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Idea 00 — the current DataTortilla mark: stacked tortilla lines in an ellipse. -->

<script lang="ts">
  import type { MarkProps } from "./marks";

  let { size = 36, title }: MarkProps = $props();

  // Keep the line weight readable as the mark shrinks (viewBox units).
  let sw = $derived(size <= 18 ? 2.1 : size <= 26 ? 1.7 : 1.5);
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
  <ellipse
    cx="24"
    cy="24"
    rx="18"
    ry="12"
    fill="var(--color-warm-100)"
    stroke="var(--accent-primary)"
    stroke-width={sw}
  />
  <path
    d="M8 20 Q24 14 40 20"
    stroke="var(--accent-primary)"
    stroke-width={sw}
    stroke-linecap="round"
    fill="none"
  />
  <path
    d="M8 24 Q24 18 40 24"
    stroke="var(--accent-primary)"
    stroke-width={sw}
    stroke-linecap="round"
    fill="none"
  />
  <path
    d="M8 28 Q24 22 40 28"
    stroke="var(--accent-primary)"
    stroke-width={sw}
    stroke-linecap="round"
    fill="none"
  />
  <circle cx="24" cy="24" r="2.5" fill="var(--accent-primary)" />
</svg>
