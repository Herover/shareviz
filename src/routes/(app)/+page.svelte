<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";
  import { goto } from "$app/navigation";
  import { db } from "$lib/chartStore";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import { settings } from "$lib/settingsStore.svelte";

  let { data }: PageProps = $props();

  if (data.session?.user) {
    goto("/org");
  }

  const newGraphic = async (synced: boolean) => {
    const docId = await db.create(synced);
    goto("/editor/chart/" + docId);
  };

  let charts: ReturnType<typeof db.getLocal> | undefined = $state();
  onMount(() => (charts = db.getLocal()));

  const switchTheme = () => {
    if (settings.theme == "dark") {
      settings.theme = "light";
    } else if (settings.theme == "light") {
      settings.theme = "system";
    } else if (settings.theme == "system") {
      settings.theme = "dark";
    } else {
      settings.theme = "light";
    }
  };
</script>

<main>
  <div class="content">
    <!-- svelte-ignore a11y_missing_attribute -->
    <a
      role="button"
      tabindex="0"
      onclick={() => switchTheme()}
      onkeydown={(e) => (e.key == "Enter" || e.key == " ") && switchTheme()}
      ><small>Switch theme</small></a
    >
    {#if !data.session?.user}
      <h1>Sign in using</h1>
      <p>
        By signing in, you will share your e-mail address, name and other login provider details.
        This information may be shared with other people in your organizations, or used to contact
        you regarding your account.
      </p>
      <SignIn provider="github" signInPage="signin" />
    {:else}
      <p>Redirecting you to <a href="/org">organization page</a>...</p>
    {/if}
    <div class="hline"></div>
    <h1>Local editor</h1>
    <p>Use without a account for free.</p>
    <p>
      Local charts are only viewable using this computer and browser, and does not allow
      collaborative features.
    </p>
    <button onclick={() => newGraphic(false)}>Create local chart</button>
    {#each charts || [] as chart}
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
