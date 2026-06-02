<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { PageData } from "./$types";
  import { TEAM_ROLES } from "$lib/consts";
  import { addTeamMember, getTeam, removeTeamMember, updateTeam } from "$lib/api";
  import { notifications } from "$lib/notificationStore";
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { invalidateAll } from "$app/navigation";
  import SettingsLayout from "$lib/components/settings/SettingsLayout.svelte";
  import SettingsCard from "$lib/components/settings/SettingsCard.svelte";
  import SettingsField from "$lib/components/settings/SettingsField.svelte";
  import MemberRow from "$lib/components/settings/MemberRow.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let { data }: { data: PageData } = $props();

  let team: Awaited<ReturnType<typeof getTeam>> | undefined = $state();
  $effect(() => {
    getTeam(page.params.teamId).then((t) => {
      team = t;
      description = t.description;
    });
  });
  let isTeamAdmin = $derived(
    team?.members.find((u) => u.user.id == data.session?.user?.id)?.role === TEAM_ROLES.ADMIN,
  );

  let userToAddToTeam: string | undefined = $state();

  // Seeded from the loaded team and persisted via the team update endpoint.
  let description = $state("");

  const sections = [
    { id: "general", label: "General", icon: "settings" as const },
    { id: "members", label: "Members", icon: "users" as const },
  ];

  const orgName = $derived(page.data.organization?.organizations?.name ?? "");
  const teamName = $derived(team?.name ?? page.data.team?.teams?.name ?? "");

  const crumbs = $derived([
    {
      label: "Charts",
      href: resolve("/(app)/(main)/org/[organizationId]/team/[teamId]/charts", {
        organizationId: page.params.organizationId ?? "",
        teamId: page.params.teamId ?? "",
      }),
    },
    { label: teamName },
    { label: "Settings" },
  ]);

  const addMember = async () => {
    if (typeof userToAddToTeam == "undefined") {
      return;
    }
    try {
      await addTeamMember(userToAddToTeam, page.params.teamId);
      userToAddToTeam = undefined;
      team = await getTeam(page.params.teamId);
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
      team = await getTeam(page.params.teamId);
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  const update = async (details: { name?: string; description?: string }) => {
    const name = details.name ?? team?.name;
    if (!name) return;
    // Nothing changed.
    if (details.name == undefined && details.description == description) return;
    if (details.name != undefined && details.name == team?.name) return;
    try {
      await updateTeam(page.params.teamId, {
        name,
        description: details.description ?? description,
      });
      if (team && details.name != undefined) team.name = details.name;
      if (details.description != undefined) description = details.description;
      invalidateAll();
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };
</script>

<SettingsLayout
  overline={orgName && teamName ? `${orgName} · ${teamName}` : orgName || teamName}
  title="Team settings"
  {sections}
  {crumbs}
>
  {#if team}
    <!-- ──────────── GENERAL ──────────── -->
    <SettingsCard
      id="general"
      overline="Team"
      title="General"
      description="The team's display name. Visible to everyone in {orgName ||
        'your organisation'}."
    >
      <SettingsField label="Team name" controlId="ts-name">
        <input
          id="ts-name"
          type="text"
          value={team.name}
          disabled={!isTeamAdmin}
          onblur={(e) => update({ name: e.currentTarget.value })}
        />
        {#if !isTeamAdmin}
          <p class="field-help">Only team administrators can rename this team.</p>
        {/if}
      </SettingsField>
      <SettingsField label="Description" sub="Optional" controlId="ts-desc">
        <textarea
          id="ts-desc"
          placeholder="What does this team publish?"
          disabled={!isTeamAdmin}
          value={description}
          onblur={(e) => update({ description: e.currentTarget.value })}
        ></textarea>
      </SettingsField>
    </SettingsCard>

    <!-- ──────────── MEMBERS ──────────── -->
    <SettingsCard
      id="members"
      overline="Access"
      title="Members"
      description="People who can open, edit and publish this team's charts. Administrators can also change team settings."
      flush
    >
      {#snippet aside()}
        <span class="member-count">
          {team?.members.length}
          {team?.members.length == 1 ? "member" : "members"}
        </span>
      {/snippet}

      {#each team.members as member (member.user.id)}
        {@const isYou = member.user.id == data.session?.user?.id}
        {@const isAdmin = member.role == TEAM_ROLES.ADMIN}
        <MemberRow
          id={member.user.id}
          name={member.user.name}
          email={member.user.email}
          roleLabel={isAdmin ? "Administrator" : "Member"}
          {isAdmin}
          {isYou}
          onRemove={isTeamAdmin && !isYou ? () => removeMember(member.user.id) : undefined}
        />
      {/each}

      {#if isTeamAdmin}
        <div class="add-member">
          <span class="add-label">Add to team</span>
          <div class="select-wrap">
            <select bind:value={userToAddToTeam}>
              <option value={undefined} disabled>Select user…</option>
              {#each data.orgUsers.filter((u) => team?.members.findIndex((m) => m.user.id == u.id) == -1) as user (user.id)}
                <option value={user.id}>{user.name}</option>
              {/each}
            </select>
          </div>
          <button
            class="btn-primary action-btn"
            disabled={userToAddToTeam == null}
            onclick={addMember}
          >
            <Icon name="plus" /> Add to team
          </button>
        </div>
      {/if}
    </SettingsCard>
  {/if}
</SettingsLayout>

<style>
  .member-count {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--fg-tertiary);
  }

  .add-member {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    background: var(--bg-base);
    flex-wrap: wrap;
  }
  .add-label {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--fg-secondary);
  }
  .select-wrap {
    max-width: 280px;
    flex: 1;
    min-width: 180px;
  }
  .select-wrap select {
    width: 100%;
    height: 34px;
    appearance: none;
    padding: 0 28px 0 12px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background-color: var(--bg-surface);
    color: var(--fg-primary);
    font-family: var(--font-body);
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B5344' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .select-wrap select:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--accent-primary-subtle);
  }

  .action-btn {
    height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
</style>
