<script lang="ts">
  import { formatDate, formatRelativeTime } from "$lib/utils";
  import type { FolderItem } from "./types";

  interface Props {
    item: FolderItem;
    onSelect: (selected: boolean) => void;
    selected: boolean;
    link?: string;
    onChangeFolder?: (id: string) => void;
    onMoveItems?: (id: string) => void;
  }

  let { item, onSelect, selected, link, onChangeFolder, onMoveItems }: Props = $props();

  const ondragstart = (e: DragEvent & { currentTarget: EventTarget & HTMLTableRowElement }) => {
    e.dataTransfer?.setData("application/id", item.id);
    onSelect(true);
  };
</script>

<tr
  class:selected
  {ondragstart}
  ondrop={() => onMoveItems && onMoveItems(item.id)}
  ondragover={(e) => e.preventDefault()}
  draggable="true"
>
  <td>
    <input checked={selected} onchange={(e) => onSelect(e.currentTarget.checked)} type="checkbox" />
  </td>
  <td>
    {#if item.type == "folder"}
      <span class="icon">📁</span>
    {:else}
      <span class="icon">📊</span>
    {/if}
    {#if link}
      <a href={link}>{item.name}</a>
    {:else if onChangeFolder}
      <span
        role="button"
        tabindex="0"
        onclick={() => onChangeFolder(item.id)}
        onkeydown={(e) => e.key == " " && onChangeFolder(item.id)}
      >
        {item.name}
      </span>
    {/if}
  </td>
  <td>{formatRelativeTime(item.updated)}</td>
  <td>{formatDate(item.created)}</td>
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
  td,
  tr {
  }
  .selected {
    background-color: #deeefc;
  }
</style>
