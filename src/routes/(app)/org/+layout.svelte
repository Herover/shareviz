<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { addTeam } from "$lib/api";
  import NavDropdown from "$lib/components/NavDropdown.svelte";
  import { notifications } from "$lib/notificationStore";
  import type { PageData } from "./$types";

  interface Props {
    children?: import("svelte").Snippet;
    data: PageData;
  }

  let { children }: Props = $props();

  const addNewTeam = async () => {
    try {
      const newTeamId = await addTeam("New Team", page.params.organizationId);
      goto(`/org/${page.params.organizationId}/team/${newTeamId}`);
      invalidateAll();
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };
</script>

<header>
  <div class="content">
    <div class="icon">DataTortilla</div>
    <nav>
      {#if page.params.organizationId}
        <div class="nav-item">
          {#if page.data.team}
            <a href="/org/{page.params.organizationId}/team/{page.params.teamId}/charts">Team</a>
          {:else if page.data.teams && page.data.teams.length != 0}
            <a href="/org/{page.params.organizationId}/team/{page.data.teams[0].teams.id}/charts"
              >Team</a
            >
          {/if}
          <NavDropdown>
            <div class="popover-content">
              {#if page.data.teams}
                {#if page.data.team}
                  <p>{page.data.team.teams.name}</p>
                  <p class="popover-link">
                    <a href={`/org/${page.params.organizationId}/team/${page.params.teamId}`}
                      >Configure team</a
                    >
                  </p>
                {/if}
                <p>Select team</p>
                {#each page.data.teams as team}
                  <p class="popover-link">
                    <a href={`/org/${page.params.organizationId}/team/${team.teams.id}/charts`}
                      >{team.teams.name}</a
                    >
                  </p>
                {/each}
                <button onclick={() => addNewTeam()}>+ New team</button>
              {/if}
            </div>
          </NavDropdown>
        </div>
        <div class="nav-item">
          <a href="/org/{page.params.organizationId}">Organization</a>
          <NavDropdown>
            <div class="popover-content">
              <p>{page.data.organization.organizations.name}</p>
              <a href="/org">Change organization</a>
            </div>
          </NavDropdown>
        </div>
      {/if}
      <div class="nav-item"><a href="/org/user">User</a></div>
    </nav>
  </div>
</header>

<main>
  {@render children?.()}
</main>

<footer></footer>

<style>
  header {
    width: 100%;
    border-bottom: solid 1px var(--detail-color);
  }
  header .content {
    box-sizing: border-box;
    width: 100%;
    max-width: var(--width-wide);
    margin: auto;
    padding-left: 1em;
    padding-right: 1em;
    height: 3em;
    display: flex;
    justify-content: start;
    align-items: center;
  }
  .icon {
    font-size: 1.9em;
    margin-right: 1em;
  }
  .nav-item {
    font-size: 1.2rem;
    padding-left: 1em;
    padding-right: 1em;
    font-weight: bold;
    color: var(--text-secondary);
  }
  .nav-item > a {
    color: var(--text-secondary);
    text-decoration: none;
  }
  .nav-item:last-child {
    padding-right: 0;
  }
  header nav {
    display: flex;
    justify-content: space-between;
    margin-left: auto;
  }
  main {
    box-sizing: border-box;
    max-width: var(--width-wide);
    margin: auto;
    padding-left: 1em;
    padding-right: 1em;
  }
  .popover-content {
    box-shadow: 0px 0px 4px 4px var(--accent-bg-color);
    background-color: var(--main-bg-color);
    padding-top: 0.5rem;
    padding-bottom: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-top: 0.5rem;
    width: 13em;
    font-size: 1rem;
    color: var(--text-primary);
  }
  .popover-content p {
    margin-top: 1em;
    margin-bottom: 1em;
    font-size: 1.1rem;
  }
  .popover-content p:first-child {
    margin-top: 0.5em;
  }
  .popover-content .popover-link {
    color: var(--text-secondary);
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-size: 1rem;
  }
</style>
