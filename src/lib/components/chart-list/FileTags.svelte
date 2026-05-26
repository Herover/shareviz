<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { FileTag } from "./types";

  interface Props {
    tags: FileTag[];
  }

  let { tags }: Props = $props();

  const MAX_VISIBLE_TAGS = 3;

  let expanded = $state(false);

  const visible = $derived(expanded ? tags : tags.slice(0, MAX_VISIBLE_TAGS));
  const hiddenCount = $derived(Math.max(0, tags.length - MAX_VISIBLE_TAGS));
  const hiddenPreview = $derived(
    tags
      .slice(MAX_VISIBLE_TAGS)
      .map((t) => t.key + (t.val ? ":" + t.val : ""))
      .join(", "),
  );
</script>

{#if tags.length > 0}
  <span class="ch-row-tags">
    {#each visible as tag (tag.id)}
      <span class="ch-row-tag" style:--tag-color={tag.color} title={tag.category}>
        <span class="ch-tag-k">{tag.key}</span>
        {#if tag.val}
          <span class="ch-tag-sep">:</span>
          <span class="ch-tag-v">{tag.val}</span>
        {/if}
      </span>
    {/each}
    {#if hiddenCount > 0 && !expanded}
      <button
        type="button"
        class="ch-row-tag-more"
        title={hiddenPreview}
        onclick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          expanded = true;
        }}
      >
        +{hiddenCount}
      </button>
    {/if}
  </span>
{/if}

<style>
  .ch-row-tags {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-left: 4px;
    min-width: 0;
  }
  /* Tint comes from each tag's --tag-color custom prop (FileTag.color);
     fallback uses the neutral sunken surface. */
  .ch-row-tag {
    display: inline-flex;
    align-items: center;
    padding: 1px 7px;
    border-radius: var(--radius-pill);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    background: var(--tag-color, var(--bg-sunken));
    color: var(--fg-secondary);
    border: 1px solid transparent;
    cursor: default;
  }
  .ch-row-tag:hover {
    border-color: var(--border-default);
    color: var(--fg-primary);
  }
  .ch-row-tag .ch-tag-k {
    color: var(--tag-color);
    filter: brightness(0.3);
    font-weight: 500;
  }
  .ch-row-tag .ch-tag-sep {
    color: var(--fg-tertiary);
    margin: 0 1px;
  }
  .ch-row-tag-more {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--fg-tertiary);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  .ch-row-tag-more:hover {
    color: var(--fg-primary);
    background: var(--bg-sunken);
  }
</style>
