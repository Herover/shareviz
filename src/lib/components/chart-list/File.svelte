<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatDate, formatRelativeTime } from "$lib/utils";
  import type { FolderItem } from "./types";

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

  const ondragstart = (e: DragEvent & { currentTarget: EventTarget & HTMLTableRowElement }) => {
    e.dataTransfer?.setData("application/id", item.id);
    onSelect(true);
    onDragStart();
  };
  const ondragend = () => {
    onDragEnd();
  };

  const clickRow = (e: MouseEvent) => {
    console.log(e);
    if (e.buttons != 0) {
      return;
    }

    goto(link);
    e.preventDefault();
  };
</script>

<tr
  class:selected
  {ondragstart}
  {ondragend}
  ondrop={() => onMoveItems && onMoveItems(item.id)}
  ondragover={(e) => e.preventDefault()}
  draggable="true"
>
  <td>
    <input checked={selected} onchange={(e) => onSelect(e.currentTarget.checked)} type="checkbox" />
  </td>
  <td onclick={(e) => clickRow(e)}>
    {#if item.type == "folder"}
      <span class="icon">📁</span>
      <a
        href={link}
        onclick={() => onChangeFolder && onChangeFolder(item.id)}
        class:drag-target={isDragging}
      >
        {item.name}
      </a>
    {:else}
      <span class="icon">📊</span>
      <a href={link}>{item.name}</a>
    {/if}
  </td>
  <td onclick={(e) => clickRow(e)}>{formatRelativeTime(item.updated)}</td>
  <td onclick={(e) => clickRow(e)}>{formatDate(item.created)}</td>
</tr>

<style>
  a {
    color: var(--text-primary);
    text-decoration: none;
  }
  .icon {
    font-size: 1.5em;
    padding-right: 0.5em;
  }
  td {
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
  tr:hover,
  .selected {
    background-color: #deeefc;
  }
  .drag-target {
    border: 2px var(--text-primary);
    border-style: dashed;
  }
</style>
