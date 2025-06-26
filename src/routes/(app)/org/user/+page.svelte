<script lang="ts">
  import { page } from "$app/state";
  import { SignOut } from "@auth/sveltekit/components";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<h3>Your user</h3>

<div class="box">
  <div class="w-025">
    Display name
    <br />
    <i>The name is loaded when you log in from your login method/identity provider</i>
  </div>
  <div class="w-075">
    {page.data.session?.user?.name}
  </div>
</div>

<div class="box p-top-1">
  <div class="w-025">Your login methods/identity providers</div>
  <div class="w-075">
    {#each data.accounts as account}
      {account.provider}: {account.expiresAt
        ? new Date(account.expiresAt).toISOString()
        : "never expires"}<br />
    {/each}
  </div>
</div>

<div class="p-top-1"></div>

<SignOut />
