<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components"
  import { page } from "$app/stores";
  import { goto } from '$app/navigation';

  let message = "";

  $: canJoin = $page.data.organizationName != null;

  $: join = async () => {
    const r = await fetch("/api/invite", {
      method: "POST",
      body: JSON.stringify({ code: $page.data.code }),
    });
    if (r.status != 200) {
      const data = await r.json();
      message = data.message;
    } else {
      goto("/editor/chart");
    }
  }
</script>

{#if message}
  <p>Error: {message}.</p>
{/if}

{#if $page.data.alreadyJoined}
  <p>You are already a member of {$page.data.organizationName}</p>
{:else if canJoin}
  <button on:click={() => join()}>Join {$page.data.organizationName}</button>
{:else if $page.data.session?.user}
  <p>Unable to use this invite, was it for another email or has it expired?</p>
{:else}
  <SignIn provider="github">
    <span slot="submitButton">Sign In with GitHub</span>
  </SignIn>
{/if}
