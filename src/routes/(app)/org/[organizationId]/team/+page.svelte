<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { page } from "$app/state";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h1>Select team</h1>

<ul>
  {#each data.teams as team}
    <a href="/org/{page.params.organizationId}/team/{team.teams.id}/charts">{team.teams.name}</a>
  {/each}
</ul>
