<script lang="ts">
  import { page } from "$app/stores";
</script>

<h1>Select organization</h1>

{#each $page.data.organizations as organization}
  <p>
    <a href="/org/{organization.organizations.id}/team/">
      {organization.organizations.name}
    </a>
  </p>
{/each}
