<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { editChartInfo, editFolder } from "$lib/api";
  import DropdownButton from "$lib/components/DropdownButton.svelte";
  import DropdownItem from "$lib/components/DropdownItem.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import File from "./File.svelte";
  import FileCard from "./FileCard.svelte";
  import type { FolderItem } from "./types";
  import { getLogger } from "$lib/log.js";

  const logger = getLogger();

  /* eslint-disable svelte/no-navigation-without-resolve */

  interface Props {
    contents: FolderItem[];
    onCreateFolder?: (parentId?: string) => void;
    onAddChart: (folderId?: string) => void;
    onImportChart?: (folderId?: string) => void;
    onUpdate: () => void;
    path: string[];
    basePath: string;
  }

  let { contents, onAddChart, onCreateFolder, onImportChart, onUpdate, path, basePath }: Props =
    $props();

  const currentFolderId = $derived(path.length == 0 ? undefined : path[path.length - 1]);

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
  let view: "list" | "grid" = $state("list");
</script>

<div class="ch-crumbs">
  <a
    href={basePath}
    ondrop={() => moveTo(null)}
    ondragover={(e) => e.preventDefault()}
    class:drag-target={isDragging && path.length != 0}
  >
    Charts
  </a>
  {#each pathNamed as part, i (i)}
    <span class="ch-crumb-sep">/</span>
    {#if i == pathNamed.length - 1}
      <input
        value={part.name}
        onblur={(e) => {
          editFolder(part.id, { name: e.currentTarget.value });
          nameOverride[part.id] = e.currentTarget.value;
        }}
        type="text"
        style:width="300px"
      />
    {:else}
      <a
        href={basePath + "/" + path.slice(0, i + 1).join("/")}
        class:drag-target={isDragging}
        ondrop={() => moveTo(part.id)}
        ondragover={(e) => e.preventDefault()}
      >
        {part.name}
      </a>
    {/if}
  {/each}
</div>

<div class="ch-list-actions">
  {#if typeof onCreateFolder == "function"}
    <button onclick={() => onCreateFolder(currentFolderId)}> + Folder </button>
  {/if}
  <DropdownButton
    label="New chart"
    onClick={() => onAddChart(currentFolderId)}
    chevronAriaLabel="More ways to create a chart"
  >
    {#snippet leadingIcon()}
      <Icon name="plus" size={14} stroke={2.4} />
    {/snippet}
    {#if typeof onImportChart == "function"}
      <DropdownItem label="Import JSON…" onClick={() => onImportChart(currentFolderId)}>
        {#snippet icon()}
          <Icon name="upload" size={16} />
        {/snippet}
      </DropdownItem>
    {/if}
  </DropdownButton>

  <div class="ch-list-actions-spacer"></div>

  <div class="ch-view-toggle" role="group" aria-label="View">
    <button
      type="button"
      class:is-active={view == "list"}
      onclick={() => (view = "list")}
      title="List view"
      aria-label="List view"
      aria-pressed={view == "list"}
    >
      <Icon name="list" size={15} stroke={2} />
    </button>
    <button
      type="button"
      class:is-active={view == "grid"}
      onclick={() => (view = "grid")}
      title="Grid view"
      aria-label="Grid view"
      aria-pressed={view == "grid"}
    >
      <Icon name="grid" size={15} stroke={2} />
    </button>
  </div>
</div>

{#if view == "list"}
  <div class="ch-table-wrap">
    <table class="ch-table">
      <thead>
        <tr>
          <th class="ch-th-check"></th>
          <th class="ch-th-icon"></th>
          <th>Name</th>
          <th class="ch-th-date">Updated</th>
          <th class="ch-th-date">Created</th>
        </tr>
      </thead>
      <tbody>
        {#if pathContents == null || pathContents.length == 0}
          <tr>
            <td colspan="5" class="ch-empty-folder">This folder is empty.</td>
          </tr>
        {:else}
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
  </div>
{:else if pathContents == null || pathContents.length == 0}
  <div class="ch-empty-folder ch-empty-folder--grid">This folder is empty.</div>
{:else}
  <div class="ch-grid">
    {#each pathContents as item (item.id)}
      {#if item.type == "file"}
        <FileCard {item} link="/editor/chart/{item.chartRef}" />
      {:else if item.type == "folder"}
        <FileCard
          {item}
          link={basePath + "/" + [...path, ""].join("/") + item.id}
          onChangeFolder={() => onChangeFolder()}
        />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .ch-crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--fg-secondary);
    margin: 16px 0;
    flex-wrap: wrap;
  }
  .ch-crumbs a {
    color: var(--fg-secondary);
    text-decoration: none;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }
  .ch-crumbs a:hover {
    color: var(--fg-primary);
    background: var(--bg-sunken);
  }
  .ch-crumb-sep {
    color: var(--fg-tertiary);
  }
  .ch-crumbs .drag-target {
    outline: 2px dashed var(--accent-primary);
    outline-offset: -2px;
    color: var(--accent-primary);
  }

  .ch-list-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .ch-list-actions-spacer {
    flex: 1;
  }

  .ch-view-toggle {
    display: inline-flex;
    background: var(--bg-sunken);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 2px;
  }
  .ch-view-toggle button {
    width: 32px;
    height: 30px;
    border: 0;
    background: transparent;
    color: var(--fg-tertiary);
    border-radius: calc(var(--radius-md) - 2px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ch-view-toggle button.is-active {
    background: var(--bg-surface);
    color: var(--fg-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .ch-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 14px;
  }
  .ch-empty-folder--grid {
    padding: 32px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-1);
  }

  .ch-table-wrap {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-1);
  }
  .ch-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
  }
  .ch-table thead th {
    text-align: left;
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    padding: 12px 14px;
    background: var(--bg-base);
    border-bottom: 1px solid var(--border-subtle);
    white-space: nowrap;
    user-select: none;
  }
  .ch-th-check {
    width: 38px;
    padding-left: 18px !important;
  }
  .ch-th-icon {
    width: 28px;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .ch-th-date {
    width: 130px;
  }

  .ch-empty-folder {
    text-align: center;
    padding: 32px 14px !important;
    color: var(--fg-tertiary);
    font-size: 0.9rem;
  }
</style>
