<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { db } from "$lib/chartStore";
  import { onMount } from "svelte";

  if (page.data.session?.user) {
    goto("/org");
  }

  const newGraphic = async (synced: boolean) => {
    const docId = await db.create(synced);
    goto("/editor/chart/" + docId);
  };

  let charts: ReturnType<typeof db.getLocal>;
  onMount(() => (charts = db.getLocal()));
</script>

<main>
  <div class="content">
    {#if !page.data.session?.user}
      <h1>Sign in using</h1>
      <SignIn provider="github" signInPage="signin" />
    {:else}
      <p>Redirecting you to <a href="/org">organization page</a>...</p>
    {/if}
    <div class="hline"></div>
    <h1>Local editor</h1>
    <p>
      Local charts are only viewable using this computer and browser, and does not allow
      collaborative features.
    </p>
    <button onclick={() => newGraphic(false)}>Create local chart</button>
    {#each charts as chart}
      <ul>
        <li>
          <a href="/editor/chart/{chart.id}">{chart?.data?.chart?.title || "Unnamed chart"}</a>
        </li>
      </ul>
    {/each}
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .content {
    max-width: 500px;
  }
</style>
