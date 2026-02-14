<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  let message = $state("");

  let canJoin = $derived($page.data.organizationName != null);

  let join = $derived(async () => {
    const r = await fetch("/api/invite", {
      method: "PUT",
      body: JSON.stringify({ code: $page.data.code }),
    });
    if (r.status != 200) {
      const data = await r.json();
      message = data.message;
    } else {
      goto(resolve("/(app)/(main)/me", {}));
    }
  });
</script>

{#if message}
  <p>Unable to use this invite, was it for another email or has it expired?</p>
  <p>Error: {message}.</p>
{/if}

{#if $page.data.alreadyJoined}
  <p>You are already a member of {$page.data.organizationName}</p>
{:else if canJoin}
  <button onclick={() => join()}>Join {$page.data.organizationName}</button>
{:else if $page.data.session?.user}
  <p>Unable to use this invite, was it for another email or has it expired?</p>
{:else}
  <p><a href={resolve("/", {})}>Sign in first</a>, and then return to this page.</p>
{/if}
