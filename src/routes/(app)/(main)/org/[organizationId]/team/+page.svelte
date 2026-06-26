<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { addTeam } from "$lib/api";
  import { TEAM_ROLES } from "$lib/consts";
  import { formatRelativeTime } from "$lib/utils";
  import { notifications } from "$lib/notificationStore";
  import PageHead from "$lib/components/PageHead.svelte";
  import UserBadge from "$lib/components/chart/UserBadge.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const orgName = $derived(page.data.organization?.organizations?.name ?? "");

  const roleLabel = (role: number) => (role === TEAM_ROLES.ADMIN ? "Admin" : "Member");

  const addNewTeam = async () => {
    try {
      const newTeamId = await addTeam("New Team", page.params.organizationId ?? "");
      await goto(
        resolve("/(app)/(main)/org/[organizationId]/team/[teamId]", {
          organizationId: page.params.organizationId ?? "",
          teamId: newTeamId,
        }),
      );
      invalidateAll();
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };
</script>

<PageHead overline={orgName} title="Your teams" />

<div class="teams-toolbar">
  <p class="teams-intro">
    The teams you're part of{orgName ? ` in ${orgName}` : ""}. There may be teams you are not a part
    of.
  </p>
  <div class="teams-actions">
    <span class="teams-count"
      >{data.teamCards.length}
      {data.teamCards.length === 1 ? "team" : "teams"}</span
    >
    <button class="btn-primary teams-new" onclick={addNewTeam}>
      <Icon name="plus" size={15} stroke={2.2} />
      New team
    </button>
  </div>
</div>

{#if data.teamCards.length === 0}
  <div class="teams-empty">
    <p>You're not part of any teams in this organization yet.</p>
    <button class="btn-primary teams-new" onclick={addNewTeam}>
      <Icon name="plus" size={15} stroke={2.2} />
      New team
    </button>
  </div>
{:else}
  <div class="teams-grid">
    {#each data.teamCards as team (team.id)}
      <a
        class="team-card"
        href={resolve("/(app)/(main)/org/[organizationId]/team/[teamId]/charts", {
          organizationId: page.params.organizationId ?? "",
          teamId: team.id,
        })}
      >
        <div class="team-card-head">
          <h2 class="team-card-name">{team.name}</h2>
          <span class="team-role" class:is-admin={team.role === TEAM_ROLES.ADMIN}>
            {roleLabel(team.role)}
          </span>
        </div>
        {#if team.description}
          <p class="team-card-desc">{team.description}</p>
        {/if}
        <div class="team-card-foot">
          <div class="team-members">
            {#if team.memberCount > 0}
              <div class="avatars">
                {#each team.members.slice(0, 3) as member (member.id)}
                  <span class="avatar"><UserBadge user={member} fill /></span>
                {/each}
                {#if team.memberCount > 3}
                  <span class="avatar avatar-more">+{team.memberCount - 3}</span>
                {/if}
              </div>
            {/if}
            <span class="team-meta"
              >{team.memberCount}
              {team.memberCount === 1 ? "member" : "members"}</span
            >
          </div>
          <span class="team-meta team-stats">
            <b>{team.chartCount}</b>
            {team.chartCount === 1 ? "chart" : "charts"}
            {#if team.lastActivity > 0}· {formatRelativeTime(team.lastActivity)}{/if}
          </span>
        </div>
      </a>
    {/each}
  </div>
{/if}

<style>
  .teams-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
  }
  .teams-intro {
    font-family: var(--font-body);
    font-size: 0.96rem;
    line-height: 1.5;
    color: var(--fg-secondary);
    margin: 0;
    max-width: 56ch;
  }
  .teams-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .teams-count {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--fg-tertiary);
    white-space: nowrap;
  }
  .teams-new {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .teams-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 56px 24px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    color: var(--fg-secondary);
    text-align: center;
  }
  .teams-empty p {
    margin: 0;
  }

  .teams-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .team-card {
    display: flex;
    flex-direction: column;
    padding: 20px 22px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-1);
    color: var(--fg-primary);
    text-decoration: none;
    cursor: pointer;
    transition:
      box-shadow 120ms var(--ease-standard),
      transform 120ms var(--ease-standard),
      border-color 120ms var(--ease-standard),
      color 120ms var(--ease-standard);
  }
  .team-card:hover {
    box-shadow: var(--shadow-2);
    transform: translateY(-2px);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
  .team-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .team-card-name {
    font-family: var(--font-display);
    font-size: 1.45rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.15;
    color: inherit;
    margin: 0;
  }
  .team-role {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-secondary);
    background: var(--bg-sunken);
    padding: 3px 8px;
    border-radius: var(--radius-pill);
  }
  .team-role.is-admin {
    color: var(--accent-primary);
    background: var(--accent-primary-subtle);
  }
  .team-card-desc {
    font-family: var(--font-body);
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--fg-secondary);
    margin: 8px 0 0;
  }
  .team-card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--border-subtle);
  }
  .team-members {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .avatars {
    display: flex;
    align-items: center;
  }
  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid var(--bg-surface);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    flex-shrink: 0;
  }
  .avatar + .avatar {
    margin-left: -9px;
  }
  .avatar-more {
    background: var(--bg-sunken);
    color: var(--fg-secondary);
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.66rem;
  }
  .team-meta {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    color: var(--fg-tertiary);
    white-space: nowrap;
  }
  .team-stats {
    font-size: 0.78rem;
    color: var(--fg-secondary);
  }
  .team-stats b {
    color: var(--fg-primary);
  }

  @media (max-width: 720px) {
    .teams-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
    .teams-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
