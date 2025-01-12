<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { notifications } from "$lib/notificationStore";
  import { user } from "$lib/userStore";
  import { db as chartStore } from "$lib/chartStore";
  import { onDestroy, onMount } from "svelte";
  import { addFolder, getTeam } from "$lib/api";
  import ChartList from "$lib/components/chart-list/ChartList.svelte";
  import type { FolderItem } from "$lib/components/chart-list/types";

  let teamId: string | undefined = $state();
  $effect(() => {
    teamId = page.params.teamId;
  });
  let directory: FolderItem[] = $state([]);
  $effect(() => {
    if (typeof teamId == "undefined") {
      user
        .geUserCharts()
        .then((c) => {
          directory = c.map((c) => ({
            type: "file",
            chartRef: c.chartRef,
            id: c.id,
            name: c.name,
            created: c.created,
            updated: c.updated,
          }));
        })
        .catch((e) => notifications.addError(e.message));
    } else {
      updateTeam(teamId);
    }
  });
  const updateTeam = async (teamId: string) => {
    const c = await getTeam(teamId);
    const dirList = c.folders.reduce(
      (acc, f) => {
        const item: FolderItem = {
          type: "folder",
          id: f.id,
          name: f.name,
          open: false,
          created: f.created,
          updated: 0,
          contents: [],
        };
        acc[f.id] = [];
        if (typeof acc[f.parentId ?? ""] == "undefined") {
          acc[f.parentId ?? ""] = [item];
        } else {
          acc[f.parentId ?? ""].push(item);
        }
        return acc;
      },
      { "": [] } as { [key: string]: FolderItem[] },
    );

    c.charts.forEach((c) =>
      dirList[c.folderId ?? ""].push({
        type: "file",
        chartRef: c.chartRef,
        id: c.id,
        name: c.name,
        created: c.created,
        updated: c.updated,
      }),
    );

    const buildDir = (path: string): FolderItem[] => {
      const folder: FolderItem[] = [];
      dirList[path].forEach((item) => {
        if (item.type == "folder") {
          item.contents = buildDir(item.id);
        }
        folder.push(item);
      });
      return folder;
    };

    directory = buildDir("");
  };

  let disconnect = () => {};
  onDestroy(() => {
    disconnect();
  });
  onMount(() => {
    disconnect = chartStore.connect();
  });

  const newGraphic = async (synced: boolean, folderId?: string) => {
    try {
      const docId = await chartStore.create(synced, teamId, folderId);
      goto("/editor/chart/" + docId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  const onAddFolder = async (name: string, teamId: string, parentId?: string) => {
    await addFolder(name, teamId, parentId);
    // TODO: we should just manually add the new folder instead of reload entire team
    await updateTeam(teamId);
  };

  const folderPath = $derived(page.params["folder"].split("/").filter((e) => e != ""));
</script>

<div class="holder">
  <h3>{page.data.team.teams.name}</h3>
  <ChartList
    contents={directory}
    onCreateFolder={(parentId) => teamId && onAddFolder("New folder", teamId, parentId)}
    onUpdate={() => teamId && updateTeam(teamId)}
    onAddChart={(id) => newGraphic(true, id)}
    basePath={`/org/${page.params["organizationId"]}/team/${teamId}/charts`}
    path={folderPath}
  />
</div>
