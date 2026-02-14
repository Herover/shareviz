<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
</script>

<h1>Select organization</h1>

{#if page.data.organizations.length == 0}
  <p>(You are not yet a part of a organization yet.)</p>
{:else}
  {#each page.data.organizations as organization (organization.id)}
    <p>
      <a
        href={resolve("/(app)/(main)/org/[organizationId]/team", {
          organizationId: organization.organizations.id,
        })}
      >
        {organization.organizations.name}
      </a>
    </p>
  {/each}
{/if}

<h1>Your personal charts</h1>
