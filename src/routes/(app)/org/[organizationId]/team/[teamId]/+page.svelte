<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { PageData } from "./$types";
  import { TEAM_ROLES } from "$lib/consts";
  import { addTeamMember, getTeam, removeTeamMember, updateTeam } from "$lib/api";
  import { notifications } from "$lib/notificationStore";
  import { page } from "$app/state";
  import { invalidateAll } from "$app/navigation";

  let { data }: { data: PageData } = $props();

  let team: Awaited<ReturnType<typeof getTeam>> | undefined = $state();
  $effect(() => {
    getTeam(page.params.teamId).then((t) => (team = t));
  });
  let isTeamAdmin = $state(false);
  $effect(() => {
    isTeamAdmin =
      team?.members.find((u) => u.user.id == data.session?.user?.id)?.role === TEAM_ROLES.ADMIN;
  });

  let userToAddToTeam: string | undefined = $state();

  const addMember = async () => {
    if (typeof userToAddToTeam == "undefined") {
      return;
    }
    try {
      await addTeamMember(userToAddToTeam, page.params.teamId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  const removeMember = async (userId: string) => {
    if (typeof page.params.teamId == "undefined") {
      return;
    }
    try {
      await removeTeamMember(userId, page.params.teamId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  const update = async (details: { name: string }) => {
    await updateTeam(page.params.teamId, details);
    if (details.name && team) team.name = details.name;
    invalidateAll();
  };
</script>

<div class="side">
  <h3>{page.data.team.teams.name}</h3>

  {#if team}
    <p>
      <label
        >Name: <input
          value={team.name}
          onblur={(e) => update({ name: e.currentTarget.value })}
        /></label
      >
    </p>
    <p>Team <b>{team.name}</b> members:</p>
    <ul>
      {#each team.members as member}
        <li>
          {member.user.name}
          {#if member.role == 2}
            (administrator)
          {/if}
          {#if member.user.id == page.data.session?.user?.id}
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
