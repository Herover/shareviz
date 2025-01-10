<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  if (page.data.session?.user) {
    goto("/org");
  }
</script>

<main>
  <div class="content">
    {#if !page.data.session?.user}
      <h1>Sign in using</h1>
      <SignIn provider="github" signInPage="signin" />
    {:else}
      <p>Redirecting you to <a href="/org">organization page</a>...</p>
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
