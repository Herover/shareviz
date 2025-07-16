<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { page } from "$app/stores";
</script>

<h1>Select organization</h1>

{#if $page.data.organizations.length == 0}
  <p>You are not yet a part of a organization yet.</p>
{:else}
  {#each $page.data.organizations as organization}
    <p>
      <a href="/org/{organization.organizations.id}/team">
        {organization.organizations.name}
      </a>
    </p>
  {/each}
{/if}
