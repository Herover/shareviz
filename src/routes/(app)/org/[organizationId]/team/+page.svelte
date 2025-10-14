<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h1>Select team</h1>

<ul>
  {#each data.teams as team (team.teams.id)}
    <a
      href={resolve("/(app)/org/[organizationId]/team/[teamId]/charts", {
        organizationId: page.params.organizationId ?? "",
        teamId: team.teams.id,
      })}>{team.teams.name}</a
    >
  {/each}
</ul>
