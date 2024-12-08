<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { notifications } from "$lib/notificationStore";
  import { user } from "$lib/userStore";
  import { db as chartStore } from "$lib/chartStore";
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import { TEAM_ROLES } from "$lib/consts";
  import { addTeam, addTeamMember, removeTeamMember } from "$lib/api";

  let { data }: { data: PageData } = $props();

  let isTeamAdmin = $state(false);
  $effect(() => {
    isTeamAdmin =
      team?.members.find((u) => u.user.id == data.session?.user?.id)?.role === TEAM_ROLES.ADMIN;
  });

  let userToAddToTeam: string | undefined = $state();
  let teamId: string | undefined = $state();
  $effect(() => {
    teamId = $page.params.teamId;
  });
  let charts: { chartRef: string; id: string; name: string, created: number }[] = $state([]);
  let team: Awaited<ReturnType<typeof user.getTeamCharts>> | undefined = $state();
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    typeof teamId == "undefined"
      ? user
          .geUserCharts()
          .then((c) => {
            charts = c;
            team = undefined;
          })
          .catch((e) => notifications.addError(e.message))
      : user
          .getTeamCharts(teamId)
          .then((c) => {
            charts = c.charts;
            team = c;
          })
          .catch((e) => notifications.addError(e.message));
  });
  const addNewTeam = async () => {
    try {
      const newTeamId = await addTeam("Test", $page.params.organizationId);
      goto(`/org/${$page.params.organizationId}/team/${newTeamId}`);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  let disconnect = () => {};
  onDestroy(() => {
    disconnect();
  });
  onMount(() => {
    disconnect = chartStore.connect();
  });

  const newGraphic = async (synced: boolean) => {
    try {
      const docId = await chartStore.create(synced, teamId);
      goto("/editor/chart/" + docId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  const addMember = async () => {
    if (typeof userToAddToTeam == "undefined" || typeof teamId == "undefined") {
      return;
    }
    try {
      await addTeamMember(userToAddToTeam, teamId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  const removeMember = async (userId: string) => {
    if (typeof teamId == "undefined") {
      return;
    }
    try {
      await removeTeamMember(userId, teamId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };
</script>

<div class="holder">
  <div class="side">
    <h3>Teams</h3>

    <div class="options">
      <a class="option" href={`/org/${$page.params.organizationId}/team`}> Your charts </a>
      {#each $user.teams as team}
        <a href={`/org/${$page.params.organizationId}/team/${team.teams.id}`} class="option">
          {team.teams.name}
        </a>
      {/each}
      <div
        onclick={() => addNewTeam()}
        onkeypress={(e) => e.key == "Enter" && addNewTeam()}
        tabindex="0"
        role="button"
        class="option"
      >
        <div class="add-option">+ New team</div>
      </div>
    </div>

    {#if team}
      <p>Team <b>{team.name}</b> members:</p>
      <ul>
        {#each team.members as member}
          <li>
            {member.user.name}
            {#if member.role == 2}
              (administrator)
            {/if}
            {#if member.user.id == $page.data.session?.user?.id}
              (you)
            {/if}
            <span
              onclick={() => removeMember(member.user.id)}
              onkeydown={(e) => (e.key == "Enter" || e.key == " ") && removeMember(member.user.id)}
              title="remove from team"
              tabindex="0"
              role="button">❌</span
            >
          </li>
        {/each}
      </ul>
      {#if isTeamAdmin}
        <p>
          Add new user to team:
          <select bind:value={userToAddToTeam}>
            <option value={null} selected disabled>Select user</option>
            {#each data.orgUsers.filter((u) => team?.members.findIndex((m) => m.user.id == u.id) == -1) as user}
              <option value={user.id}>{user.name}</option>
            {/each}
          </select>
          <button onclick={addMember} disabled={userToAddToTeam == null}>+ Add to team</button>
        </p>
      {/if}
    {/if}
  </div>

  <div class="side">
    <h3>
      Charts <button onclick={() => newGraphic(true)}>Create new</button>
    </h3>
    <ul>
      {#each charts as chart}
        <li>
          <a href="/editor/chart/{chart.chartRef}">{chart.name}</a>
          <small>{new Date(chart.created).toISOString()}</small>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .holder {
    display: flex;
    justify-content: space-between;
  }
  .side {
    box-sizing: border-box;
    margin-left: 2em;
    flex: auto;
  }
  .side:first-child {
    margin-left: 0;
    flex: initial;
    width: 240px;
  }

  .options {
    box-sizing: border-box;
    border: 1px solid var(--detail-color);
    background-color: var(--accent-bg-color);
    border-radius: 0.6em;
    cursor: pointer;
  }
  .option {
    padding-left: 1em;
    padding-right: 1em;
    padding-top: 0.7em;
    padding-bottom: 0.7em;
    border-bottom: 1px solid var(--detail-color);
  }
  .option:last-child {
    border-bottom: 0px solid;
  }
  a.option {
    width: 100%;
    height: 100%;
    display: inline-block;
    box-sizing: border-box;
  }
  .add-option {
    text-align: center;
  }
</style>
