<script lang="ts">
  import { formatDate, formatRelativeTime } from "$lib/utils";
  import type { File } from "./types";

  interface Props {
    item: File;
  }

  let { item }: Props = $props();
</script>

<tr>
  <td>
    <b><a href="/editor/chart/{item.chartRef}">{item.name}</a></b>
  </td>
  <td>{formatRelativeTime(item.updated)}</td>
  <td>{formatDate(item.created)}</td>
</tr>
