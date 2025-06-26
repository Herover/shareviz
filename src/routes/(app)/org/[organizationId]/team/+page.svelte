<script lang="ts">
  import { page } from "$app/state";
</script>

<h1>Select team</h1>

<ul>
  {#each page.data.teams as team}
    <a href="/org/{page.params.organizationId}/team/{team.teams.id}/charts">{team.teams.name}</a>
  {/each}
</ul>