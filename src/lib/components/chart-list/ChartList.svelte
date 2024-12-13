<script lang="ts">
  import File from "./File.svelte";
  import type { FolderItem } from "./types";

  interface Props {
    contents: FolderItem[];
  }

  let { contents }: Props = $props();
</script>

<table class="charts">
  <thead>
    <tr>
      <th> Name </th>
      <th style:width="120px"> Updated </th>
      <th style:width="100px"> Created </th>
    </tr>
  </thead>
  <tbody>
    {#each contents as item}
      {#if item.type == "file"}
        <File {item} />
      {:else if item.type == "folder"}
        <tr><th colspan="3">{item.name}</th></tr>
      {/if}
    {/each}
  </tbody>
</table>

<style>
  .charts {
    width: 100%;
  }
  .charts th {
    text-align: start;
  }
</style>
