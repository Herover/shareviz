<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { formatRelativeTime } from "$lib/utils";
  import ChartPreview from "./ChartPreview.svelte";
  import FileTags from "./FileTags.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { FolderItem } from "./types";

  /* eslint-disable svelte/no-navigation-without-resolve */

  interface Props {
    item: FolderItem;
    link: string;
    onChangeFolder?: (id: string) => void;
  }

  let { item, link, onChangeFolder }: Props = $props();
</script>

<a
  class="ch-grid-card"
  class:is-folder={item.type == "folder"}
  href={link}
  onclick={() => item.type == "folder" && onChangeFolder && onChangeFolder(item.id)}
>
  <div class="ch-grid-preview">
    {#if item.type == "folder"}
      <Icon name="folder" size={48} stroke={1.25} />
    {:else}
      <div class="ch-grid-preview-placeholder" aria-hidden="true">
        <ChartPreview {item} />
      </div>
      <div class="ch-grid-preview-overlay"></div>
    {/if}
  </div>
  <div class="ch-grid-body">
    <div class="ch-grid-title">{item.name}</div>
    {#if item.type == "file" && item.tags}
      <FileTags tags={item.tags} />
    {/if}
    <div class="ch-grid-meta">
      {#if item.type == "folder"}
        {item.contents.length}
        {item.contents.length === 1 ? "item" : "items"}
      {:else}
        {item.updated == 0 ? "—" : formatRelativeTime(item.updated)}
      {/if}
    </div>
  </div>
</a>

<style>
  .ch-grid-card {
    --preview-height: 300px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    box-shadow: var(--shadow-1);
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition:
      box-shadow var(--duration-micro) var(--ease-standard),
      transform var(--duration-micro) var(--ease-standard);
    position: relative;
  }
  .ch-grid-card:hover {
    box-shadow: var(--shadow-2);
    transform: translateY(-1px);
  }

  .ch-grid-preview {
    height: var(--preview-height);
    background: var(--bg-sunken);
    border-bottom: 1px solid var(--border-subtle);
    color: var(--accent-secondary);
    overflow: hidden;
  }
  .ch-grid-card.is-folder .ch-grid-preview {
    color: var(--state-warning);
  }
  .ch-grid-preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-tertiary);
    background-color: var(--bg-surface);
    /* background: repeating-linear-gradient(
      45deg,
      var(--bg-sunken),
      var(--bg-sunken) 8px,
      var(--bg-surface) 8px,
      var(--bg-surface) 16px
    ); */
  }
  .ch-grid-preview-overlay {
    width: 100%;
    height: var(--preview-height);
    background-color: rgba(255, 255, 255, 0.25);
    position: absolute;
    top: 0px;
    left: 0px;
  }

  .ch-grid-body {
    padding: 10px 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ch-grid-title {
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--fg-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ch-grid-meta {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--fg-tertiary);
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
