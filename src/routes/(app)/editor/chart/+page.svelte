<script lang="ts">
  import { run } from "svelte/legacy";

  import { SignIn, SignOut } from "@auth/sveltekit/components";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { user } from "$lib/userStore";
  import { db } from "$lib/chartStore";
  import { onDestroy } from "svelte";
  import { notifications } from "$lib/notificationStore";
  import type { ChartInfo } from "./../../../../server_lib/user";
  import { group, orDefault } from "$lib/utils";

  let charts = $state<ChartInfo[] | null>(null);
  let chartsByTeam = $derived(
    charts == null
      ? []
      : group(
          "teamId",
          charts.filter((d) => d.teamId != null),
          (k, g) => ({ k, g }),
        ),
  );
  let userCharts = $derived(charts == null ? [] : charts.filter((d) => d.teamId == null));

  let disconnect = $state(() => {});
  onDestroy(() => {
    disconnect();
  });
  run(() => {
    if ($page.data.session?.user) {
      disconnect = db.connect();
      fetch("/api/chart")
        .then((req) => req.json())
        .then((data) => (charts = data.charts))
        .catch((e) => notifications.addError(e.message));
    } else {
      disconnect = () => {};
      charts = null;
    }
  });

  const newGraphic = async (synced: boolean) => {
    const docId = await db.create(synced);
    goto("/editor/chart/" + docId);
  };
</script>

<div class="main">
  <div class="holder">
    <div class="container">
      <h1>Welcome {$page.data.session?.user?.name}</h1>
      {#if !$page.data.session?.user}
        <SignIn provider="github" signInPage="signin" />
      {:else}
        <SignOut signOutPage="signout" />
      {/if}
      <br /><br />
      {#if $page.data.session?.user}
        <button onclick={() => newGraphic(true)}>New graphic</button>
      {/if}
      <button onclick={() => newGraphic(false)}>New local graphic</button>
      {#if charts == null}
        ...
      {:else}
        <h2>Your charts</h2>
        {#each userCharts as chart}
          <p dir="auto">
            <a href="/editor/chart/{chart.chartRef}">{chart.name}</a>
          </p>
        {/each}
        {#each chartsByTeam as byTeam}
          <h2>
            {orDefault($user.teams.find((d) => d.id == byTeam.k)?.name, "Your charts")}
          </h2>
          {#each byTeam.g as chart}
            <p dir="auto">
              <a href="/editor/chart/{chart.chartRef}">{chart.name}</a>
            </p>
          {/each}
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .main {
    flex-direction: row;
    align-content: space-between;
    background-color: #eeeeee;
    height: 100vh;
  }
  /* .holder {
  } */
  .container {
    max-width: 400px;
    padding: 1em;
    margin: auto;
    background-color: white;
  }
  h1 {
    margin-top: 0em;
    margin-bottom: 0.5em;
  }
</style>
