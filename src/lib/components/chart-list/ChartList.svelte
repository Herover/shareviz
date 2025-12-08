<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { editChartInfo, editFolder } from "$lib/api";
  import File from "./File.svelte";
  import type { FolderItem } from "./types";
  import { getLogger } from "$lib/log.js";

  const logger = getLogger();

  /* eslint-disable svelte/no-navigation-without-resolve */

  interface Props {
    contents: FolderItem[];
    onCreateFolder: (parentId?: string) => void;
    onAddChart: (folderId?: string) => void;
    onUpdate: () => void;
    path: string[];
    basePath: string;
  }

  let { contents, onAddChart, onCreateFolder, onUpdate, path, basePath }: Props = $props();

  let selectedFiles: { [key: string]: boolean } = $state({});
  let selectedFolders: { [key: string]: boolean } = $state({});

  const onChangeFolder = () => {
    selectedFiles = {};
    selectedFolders = {};
  };

  const nameOverride: { [key: string]: string } = {};

  let pathNamed: { id: string; name: string }[] = $derived(
    path.reduce(
      (acc, e) => {
        const dir = acc.dir.find((f) => f.id == e);
        if (typeof dir == "undefined") {
          return acc;
        }
        if (dir?.type != "folder") {
          logger.error("Unable to find path name");
          return acc;
        }
        acc.path.push({ id: e, name: nameOverride[e] ?? dir.name });
        acc.dir = dir.contents;
        return acc;
      },
      { dir: contents, path: [] } as { dir: FolderItem[]; path: { id: string; name: string }[] },
    ).path,
  );

  let pathContents: FolderItem[] | null = $derived(
    path.reduce(
      (acc, p) => {
        if (acc == null) return null;

        const el = acc.find((e) => e.id == p);
        if (el?.type == "folder") {
          return el.contents;
        }

        return null;
      },
      contents as FolderItem[] | null,
    ),
  );

  const moveTo = async (destinationId: string | null) => {
    const chartIds = Object.keys(selectedFiles).reduce((acc, e) => {
      if (selectedFiles[e]) {
        acc.push(e);
      }
      return acc;
    }, [] as string[]);
    for (let i = 0; i < chartIds.length; i++) {
      const chartId = chartIds[i];
      await editChartInfo(chartId, { folderId: destinationId });
      selectedFiles[chartId] = false;
    }

    const folderIds = Object.keys(selectedFolders).reduce((acc, e) => {
      if (selectedFolders[e]) {
        acc.push(e);
      }
      return acc;
    }, [] as string[]);
    for (let i = 0; i < folderIds.length; i++) {
      const folderId = folderIds[i];
      if (folderId == destinationId) {
        continue;
      }
      await editFolder(folderId, { parentId: destinationId });
      selectedFolders[folderId] = false;
    }

    onUpdate();
  };

  let isDragging: boolean = $state(false);
</script>

<a
  href={basePath}
  ondrop={() => moveTo(null)}
  ondragover={(e) => e.preventDefault()}
  class:drag-target={isDragging && path.length != 0}
>
  Charts
</a>
{#each pathNamed as part, i (i)}
  /
  {#if i == pathNamed.length - 1}
    <input
      value={part.name}
      onblur={(e) => {
        editFolder(part.id, { name: e.currentTarget.value });
        nameOverride[part.id] = e.currentTarget.value;
      }}
    />
  {:else}
    <a
      href={basePath + "/" + path.slice(0, i + 1).join("/")}
      class:drag-target={isDragging}
      ondrop={() => moveTo(part.id)}
      ondragover={(e) => e.preventDefault()}>{part.name}</a
    >
  {/if}
{/each}
<table class="charts">
  <thead>
    <tr>
      <th style:width="2em"></th>
      <th>
        Name
        <button
          onclick={() => onCreateFolder(path.length == 0 ? undefined : path[path.length - 1])}
        >
          + Folder
        </button>
        <button onclick={() => onAddChart(path.length == 0 ? undefined : path[path.length - 1])}>
          + Chart
        </button>
      </th>
      <th style:width="120px"> Updated </th>
      <th style:width="100px"> Created </th>
    </tr>
  </thead>
  <tbody>
    {#if pathContents != null}
      {#each pathContents as item (item.id)}
        {#if item.type == "file"}
          <File
            {item}
            onSelect={(selected) => (selectedFiles[item.chartRef] = selected)}
            selected={selectedFiles[item.chartRef] == true}
            link="/editor/chart/{item.chartRef}"
            onDragStart={() => (isDragging = true)}
            onDragEnd={() => (isDragging = false)}
          />
        {:else if item.type == "folder"}
          <File
            {item}
            onSelect={(selected) => (selectedFolders[item.id] = selected)}
            selected={selectedFolders[item.id] == true}
            onChangeFolder={() => onChangeFolder()}
            onMoveItems={(id) => moveTo(id)}
            onDragStart={() => (isDragging = true)}
            onDragEnd={() => (isDragging = false)}
            link={basePath + "/" + [...path, ""].join("/") + item.id}
            {isDragging}
          />
        {/if}
      {/each}
    {/if}
  </tbody>
</table>

<style>
  .charts {
    width: 100%;
    border-spacing: 0px;
  }
  .charts th {
    text-align: start;
    font-weight: normal;
    color: var(--text-secondary);
    padding-bottom: 0.5em;
  }
  .drag-target {
    border: 2px var(--text-primary);
    border-style: dashed;
  }
</style>
