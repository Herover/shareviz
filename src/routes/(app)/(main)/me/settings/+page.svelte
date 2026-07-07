<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { page } from "$app/state";
  import { settings } from "$lib/settingsStore.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h3>Your user</h3>

<div class="user-row">
  <div class="user-label">
    Display name
    <br />
    <i>The name is loaded when you log in from your login method/identity provider</i>
  </div>
  <div>
    {page.data.session?.user?.name}
  </div>
</div>

<div class="user-row">
  <div class="user-label">Your login methods/identity providers</div>
  <div>
    {#each data.accounts as account (account.id)}
      {account.provider}: {account.expiresAt
        ? new Date(account.expiresAt).toISOString()
        : "never expires"}<br />
    {/each}
  </div>
</div>

<div class="p-top-1"></div>

<form action="/signout" method="post"><button type="submit">Sign out</button></form>

<button onclick={() => settings.cycleTheme()}> Switch theme </button>

<style>
  .user-row {
    display: grid;
    grid-template-columns: 40% 1fr;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }
  .user-label {
    font-size: 1.1rem;
    color: var(--fg-secondary);
  }
</style>
