<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts" module>
  // Shared across all File rows so each row can tell whether *it* is the row
  // currently being dragged. dataTransfer.getData() isn't readable during
  // dragover in most browsers, so we can't use that to detect self.
  let draggingId: string | null = $state(null);
</script>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatDate, formatRelativeTime } from "$lib/utils";
  import type { FolderItem } from "./types";

  /* eslint-disable svelte/no-navigation-without-resolve */

  interface Props {
    item: FolderItem;
    onSelect: (selected: boolean) => void;
    selected: boolean;
    link: string;
    onChangeFolder?: (id: string) => void;
    onMoveItems?: (id: string) => void;
    onDragEnd: () => void;
    onDragStart: () => void;
    isDragging?: boolean;
  }

  let {
    item,
    onSelect,
    selected,
    link,
    onChangeFolder,
    onMoveItems,
    onDragEnd,
    onDragStart,
    isDragging,
  }: Props = $props();

  let dropOver = $state(false);

  const ondragstart = (e: DragEvent & { currentTarget: EventTarget & HTMLTableRowElement }) => {
    e.dataTransfer?.setData("application/id", item.id);
    draggingId = item.id;
    onSelect(true);
    onDragStart();
  };
  const ondragend = () => {
    dropOver = false;
    draggingId = null;
    onDragEnd();
  };
  const ondragover = (e: DragEvent) => {
    e.preventDefault();
    if (item.type == "folder" && draggingId !== item.id) {
      dropOver = true;
    }
  };
  const ondragleave = () => {
    dropOver = false;
  };
  const ondrop = () => {
    dropOver = false;
    if (item.type == "folder" && onMoveItems) {
      onMoveItems(item.id);
    }
  };

  const clickRow = (e: MouseEvent) => {
    if (e.buttons != 0) {
      return;
    }
    goto(link);
    e.preventDefault();
  };
</script>

<tr
  class:is-selected={selected}
  class:is-drop-target={dropOver && isDragging}
  {ondragstart}
  {ondragend}
  {ondragover}
  {ondragleave}
  {ondrop}
  draggable="true"
>
  <td class="ch-row-check">
    <input checked={selected} onchange={(e) => onSelect(e.currentTarget.checked)} type="checkbox" />
  </td>
  <td class="ch-row-icon">
    <div
      class="ch-row-icon-wrap"
      class:ch-row-icon-folder={item.type == "folder"}
      class:ch-row-icon-chart={item.type == "file"}
    >
      {#if item.type == "folder"}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      {:else}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      {/if}
    </div>
  </td>
  <td onclick={clickRow}>
    <div class="ch-row-name">
      {#if item.type == "folder"}
        <a href={link} onclick={() => onChangeFolder && onChangeFolder(item.id)}>
          {item.name}
        </a>
        <span class="ch-row-name-meta">
          {item.contents.length}
          {item.contents.length === 1 ? "item" : "items"}
        </span>
      {:else}
        <a href={link}>{item.name}</a>
      {/if}
    </div>
  </td>
  <td class="ch-row-date" class:ch-row-date-empty={item.updated == 0} onclick={clickRow}>
    {item.updated == 0 ? "—" : formatRelativeTime(item.updated)}
  </td>
  <td class="ch-row-date" onclick={clickRow}>{formatDate(item.created)}</td>
</tr>

<style>
  tr {
    border-bottom: 1px solid var(--border-subtle);
    transition: background var(--duration-micro) var(--ease-standard);
    cursor: grab;
  }
  tr:last-child {
    border-bottom: 0;
  }
  tr:hover {
    background: var(--bg-base);
  }
  tr.is-selected {
    background: var(--accent-primary-wash);
  }
  tr.is-selected:hover {
    background: var(--accent-primary-wash);
    filter: brightness(0.98);
  }
  tr.is-drop-target {
    background: var(--state-warning-bg);
    outline: 2px dashed var(--state-warning);
    outline-offset: -2px;
  }
  td {
    padding: 10px 14px;
    font-size: 0.95rem;
    color: var(--fg-primary);
    vertical-align: middle;
  }

  .ch-row-check {
    padding-left: 18px !important;
  }
  .ch-row-check input {
    accent-color: var(--accent-primary);
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .ch-row-icon {
    padding-left: 0 !important;
    padding-right: 0 !important;
    width: 28px;
  }
  .ch-row-icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .ch-row-icon-folder {
    color: var(--state-warning);
  }
  .ch-row-icon-chart {
    color: var(--accent-secondary);
  }

  .ch-row-name {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ch-row-name a {
    font-family: var(--font-body);
    font-size: 0.97rem;
    color: var(--fg-primary);
    text-decoration: none;
    font-weight: 500;
  }
  .ch-row-name a:hover {
    color: var(--accent-primary);
    text-decoration: underline;
  }
  .ch-row-name-meta {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--fg-tertiary);
    margin-left: 4px;
  }

  .ch-row-date {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--fg-secondary);
    white-space: nowrap;
  }
  .ch-row-date-empty {
    color: var(--fg-tertiary);
  }
</style>
