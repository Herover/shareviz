<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Round initials avatar with a stable colour derived from an id. -->

<script lang="ts">
  interface Props {
    name: string | null;
    id: string;
    size?: number;
  }
  let { name, id, size = 38 }: Props = $props();

  const palette = [
    "var(--color-slate-500)",
    "var(--color-terra-500)",
    "var(--color-sage-500)",
    "var(--color-amber-500)",
    "var(--color-slate-300)",
    "var(--color-terra-300)",
    "var(--color-sage-300)",
    "var(--color-amber-300)",
  ];

  const initials = $derived(
    (name ?? "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?",
  );

  const color = $derived.by(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
  });
</script>

<div
  class="avatar"
  style:width="{size}px"
  style:height="{size}px"
  style:font-size="{Math.round(size * 0.36)}px"
  style:background={color}
>
  {initials}
</div>

<style>
  .avatar {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--fg-inverse);
    flex-shrink: 0;
    letter-spacing: 0.01em;
    user-select: none;
  }
</style>
