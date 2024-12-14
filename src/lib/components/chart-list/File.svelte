<script lang="ts">
  import { formatDate, formatRelativeTime } from "$lib/utils";
  import type { File } from "./types";

  interface Props {
    item: File;
    onSelect: (selected: boolean) => void;
    selected: boolean;
  }

  let { item, onSelect, selected }: Props = $props();

  const ondragstart = (e: DragEvent & { currentTarget: EventTarget & HTMLTableCellElement }) => {
    e.dataTransfer?.setData("application/id", item.id);
    onSelect(true);
  };
</script>

<tr>
  <td {ondragstart} draggable="true">
    <input checked={selected} onchange={(e) => onSelect(e.currentTarget.checked)} type="checkbox" />
  </td>
  <td {ondragstart} draggable="true">
    <b><a href="/editor/chart/{item.chartRef}">{item.name}</a></b>
  </td>
  <td>{formatRelativeTime(item.updated)}</td>
  <td>{formatDate(item.created)}</td>
</tr>
