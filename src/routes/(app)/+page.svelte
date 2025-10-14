<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import { db } from "$lib/chartStore";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import { settings } from "$lib/settingsStore.svelte";
  import { notifications } from "$lib/notificationStore";
  import { resolve } from "$app/paths";

  let { data }: PageProps = $props();

  if (data.session?.user) {
    goto(resolve("/(app)/org"));
  }

  if (data.msg) {
    notifications.addError(
      data.msg == "password_error" ? "Check if username and password is correct" : "",
    );
  }

  const newGraphic = async (synced: boolean) => {
    const docId = await db.create(synced);
    goto(resolve("/(app)/editor/chart/[id]", { id: docId }));
  };

  let charts: ReturnType<typeof db.getLocal> | undefined = $state();
  onMount(() => (charts = db.getLocal()));
</script>

<main>
  <div class="content">
    <!-- svelte-ignore a11y_missing_attribute -->
    <a
      role="button"
      tabindex="0"
      onclick={() => settings.cycleTheme()}
      onkeydown={(e) => (e.key == "Enter" || e.key == " ") && settings.cycleTheme()}
      ><small>Switch theme</small></a
    >
    {#if !data.session?.user}
      <h1>Sign in using</h1>
      <p>
        By signing in, you will share your e-mail address, name and other login provider details.
        This information may be shared with other people in your organizations, or used to contact
        you regarding your account.
      </p>
      <form method="POST" action="/signin?/password">
        <label>Username <input name="username" /></label>
        <br />
        <label>Password <input name="password" type="password" /></label>
        <br />
        <button type="submit">Login</button>
      </form>
    {:else}
      <p>Redirecting you to <a href={resolve("/(app)/org")}>organization page</a>...</p>
    {/if}
    <div class="hline"></div>
    <h1>Local editor</h1>
    <p>Use without a account for free.</p>
    <p>
      Local charts are only viewable using this computer and browser, and does not allow
      collaborative features.
    </p>
    <button onclick={() => newGraphic(false)}>Create local chart</button>
    {#each charts || [] as chart (chart.id)}
      <ul>
        <li>
          <a href={resolve("/(app)/editor/chart/[id]", { id: chart.id })}
            >{chart?.data?.chart?.title || "Unnamed chart"}</a
          >
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
