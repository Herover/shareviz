<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import ChartList from "$lib/components/chart-list/ChartList.svelte";
  import type { FolderItem } from "$lib/components/chart-list/types";
  import { db as chartStore } from "$lib/chartStore";
  import { notifications } from "$lib/notificationStore";
  import { getLogger } from "$lib/log";
  import { onMount } from "svelte";
  import { user } from "$lib/userStore";

  const logger = getLogger();

  let directory: FolderItem[] = $state([]);

  let updateChartList = async () => {
    const charts = await user.geUserCharts();

    directory = charts.map((chart) => {
      return {
        type: "file",
        name: chart.name,
        id: chart.id,
        created: chart.created,
        updated: chart.updated,
        chartRef: chart.chartRef,
      };
    });
  };

  onMount(() => {
    updateChartList();
  });

  const folderPath = $derived.by(() => {
    const parts = (page.params["folder"] ?? "").split("/").filter((e) => e != "");
    // if (parts.length != 0 && parts[0] == "f") {
    //   return parts.slice(1);
    // }
    return parts;
  });
  $effect(() => {
    if (folderPath.length == 1 && folderPath[0] == "f") {
      goto(resolve("(app)/(main)/me", {}));
    }
  });

  const updateFolders = () => {};
  const newGraphic = async (folderId?: string) => {
    try {
      const docId = await chartStore.create(true, undefined, folderId, undefined, true);
      goto(resolve("/(app)/editor/chart/[id]", { id: docId }));
    } catch (err) {
      notifications.addError((err as Error).message);
      logger.error("unable to create chart", err);
    }
  };
</script>

<h1>Select organization</h1>

{#if page.data.organizations.length == 0}
  <p>(You are not yet a part of a organization yet.)</p>
{:else}
  {#each page.data.organizations as organization (organization.id)}
    <p>
      <a
        href={resolve("/(app)/(main)/org/[organizationId]/team", {
          organizationId: organization.organizations.id,
        })}
      >
        {organization.organizations.name}
      </a>
    </p>
  {/each}
{/if}

<h1>Your personal charts</h1>
<ChartList
  contents={directory}
  onUpdate={() => updateFolders()}
  onAddChart={(id) => newGraphic(id)}
  basePath={resolve("(app)/(main)/me/f/", {})}
  path={folderPath}
/>
