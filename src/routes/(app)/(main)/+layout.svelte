<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { addTeam } from "$lib/api";
  import NavDropdown from "$lib/components/NavDropdown.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { notifications } from "$lib/notificationStore";

  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  const addNewTeam = async () => {
    try {
      const newTeamId = await addTeam("New Team", page.params.organizationId ?? "");
      goto(
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

<header class="ch-nav">
  <a class="ch-nav-brand" href={resolve("/(app)/(main)/org", {})}>
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="12"
        fill="var(--color-warm-100)"
        stroke="var(--accent-primary)"
        stroke-width="1.5"
      />
      <path
        d="M8 20 Q24 14 40 20"
        stroke="var(--accent-primary)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M8 24 Q24 18 40 24"
        stroke="var(--accent-primary)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M8 28 Q24 22 40 28"
        stroke="var(--accent-primary)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <circle cx="24" cy="24" r="2.5" fill="var(--accent-primary)" />
    </svg>
    <span>Data<span class="b-tortilla">Tortilla</span></span>
  </a>

  <div class="ch-nav-items">
    {#if page.params.organizationId}
      <div class="ch-nav-item">
        {#if page.data.team}
          <a
            href={resolve("/(app)/(main)/org/[organizationId]/team/[teamId]/charts", {
              organizationId: page.params.organizationId,
              teamId: page.params.teamId ?? "",
            })}>Team</a
          >
        {:else if page.data.teams && page.data.teams.length != 0}
          <a
            href={resolve("/(app)/(main)/org/[organizationId]/team/[teamId]/charts", {
              organizationId: page.params.organizationId,
              teamId: page.data.teams[0].teams.id,
            })}>Team</a
          >
        {/if}
        <NavDropdown ariaLabel="Switch team">
          <div class="ch-pop">
            {#if page.data.teams}
              {#if page.data.team}
                <div class="ch-pop-current">
                  <span class="ch-pop-dot"></span>
                  {page.data.team.teams.name}
                </div>
                <a
                  class="ch-pop-link"
                  href={resolve("/(app)/(main)/org/[organizationId]/team/[teamId]", {
                    organizationId: page.params.organizationId,
                    teamId: page.params.teamId ?? "",
                  })}>Configure team →</a
                >
                <div class="ch-pop-divider"></div>
              {/if}
              <div class="ch-pop-section">Select team</div>
              {#each page.data.teams as team (team.teams.id)}
                <a
                  class="ch-pop-item"
                  class:is-current={page.data.team && page.data.team.teams.id === team.teams.id}
                  href={resolve("/(app)/(main)/org/[organizationId]/team/[teamId]/charts", {
                    organizationId: page.params.organizationId,
                    teamId: team.teams.id,
                  })}
                >
                  <span>{team.teams.name}</span>
                </a>
              {/each}
              <div class="ch-pop-divider"></div>
              <button class="ch-pop-cta" onclick={() => addNewTeam()}>
                <Icon name="plus" size={14} stroke={2.2} />
                New team
              </button>
            {/if}
          </div>
        </NavDropdown>
      </div>

      <div class="ch-nav-item">
        <a
          href={resolve("/(app)/(main)/org/[organizationId]", {
            organizationId: page.params.organizationId,
          })}>Organization</a
        >
        <NavDropdown ariaLabel="Switch organization">
          <div class="ch-pop">
            <div class="ch-pop-current">
              <span class="ch-pop-dot ch-pop-dot-secondary"></span>
              {page.data.organization.organizations.name}
            </div>
            <a class="ch-pop-link" href={resolve("/(app)/(main)/org", {})}>
              Change organization →
            </a>
          </div>
        </NavDropdown>
      </div>
    {/if}

    <div class="ch-nav-item ch-nav-item-user">
      <a href={resolve("/(app)/(main)/me/settings", {})}>User</a>
    </div>
  </div>
</header>

<main>
  {@render children?.()}
</main>

<footer></footer>

<style>
  .ch-nav {
    height: 52px;
    display: flex;
    align-items: stretch;
    padding: 0 32px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 30;
  }
  .ch-nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--fg-primary);
    text-decoration: none;
    letter-spacing: -0.01em;
    padding-right: 24px;
    border-right: 1px solid var(--border-subtle);
    margin-right: 4px;
  }
  .ch-nav-brand .b-tortilla {
    color: var(--accent-primary);
  }
  .ch-nav-items {
    display: flex;
    align-items: stretch;
    flex: 1;
  }
  .ch-nav-item {
    position: relative;
    display: flex;
    align-items: center;
  }
  .ch-nav-item > a {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 4px 0 16px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--fg-secondary);
    text-decoration: none;
    font-weight: 500;
  }
  .ch-nav-item > a:hover {
    color: var(--fg-primary);
  }
  .ch-nav-item-user {
    margin-left: auto;
    padding-right: 0;
  }
  .ch-nav-item-user > a {
    padding-right: 16px;
  }

  /* dropdown popover content (styled inside NavDropdown's positioned wrapper) */
  main {
    box-sizing: border-box;
    max-width: var(--width-wide);
    margin: auto;
    padding: 32px 16px 96px;
  }

  .ch-pop {
    min-width: 240px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-2);
    padding: 6px;
    display: flex;
    flex-direction: column;
    animation: ch-pop-in 120ms var(--ease-standard);
  }
  @keyframes ch-pop-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .ch-pop-section {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    padding: 10px 10px 6px;
  }
  .ch-pop-current {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 10px 6px;
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--fg-primary);
  }
  .ch-pop-current .ch-pop-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-primary);
  }
  .ch-pop-current .ch-pop-dot-secondary {
    background: var(--accent-secondary);
  }
  .ch-pop-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    color: var(--fg-primary);
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: 0;
    width: 100%;
    text-align: left;
    font-family: var(--font-body);
  }
  .ch-pop-item:hover {
    background: var(--bg-base);
    color: var(--fg-primary);
  }
  .ch-pop-item.is-current {
    color: var(--accent-primary);
    font-weight: 600;
  }
  .ch-pop-item.is-current::after {
    content: "✓";
    margin-left: auto;
    color: var(--accent-primary);
    font-weight: 700;
  }
  .ch-pop-divider {
    height: 1px;
    margin: 4px 0;
    background: var(--border-subtle);
  }
  .ch-pop-cta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--accent-primary);
    cursor: pointer;
    background: transparent;
    border: 0;
    width: 100%;
    text-align: left;
    font-family: var(--font-body);
    height: auto;
  }
  .ch-pop-cta:hover {
    background: var(--accent-primary-subtle);
  }
  .ch-pop-link {
    display: block;
    padding: 6px 10px;
    font-size: 0.85rem;
    color: var(--color-link);
    text-decoration: none;
    font-family: var(--font-body);
  }
  .ch-pop-link:hover {
    text-decoration: underline;
    color: var(--color-link-hover);
  }
</style>
