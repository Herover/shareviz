<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Links to the team pages of every organization the user belongs to. -->

<script lang="ts">
  import { resolve } from "$app/paths";

  interface Props {
    organizations: { id: string; organizations: { id: string; name: string } }[];
  }
  let { organizations }: Props = $props();
</script>

{#if organizations.length == 0}
  <p>You are not part of an organization yet.</p>
{:else}
  {#each organizations as organization (organization.id)}
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
