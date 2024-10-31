<script lang="ts">
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { notifications } from "$lib/notificationStore";
  import { user } from "$lib/userStore";
  import { db as chartStore } from "$lib/chartStore";


  let teamId: null | string = null;
  $: charts =
    teamId == null
      ? user.geUserCharts()
      : user.getTeamCharts(teamId);
  const selectTeam = async (tId: string | null) => {
    teamId = tId;
  };
  const addTeam = async () => {};

  let disconnect = () => {};
  onDestroy(() => {
    disconnect();
  });
  $: {
    if ($page.data.session?.user) {
      disconnect = chartStore.connect();
      fetch("/api/chart")
        .then(req => req.json())
        .then(data => charts = data.charts)
        .catch(e => notifications.addError(e.message));
    } else {
      disconnect = () => {};
    }
  }

  const newGraphic = async (synced: boolean) => {
    const docId = await chartStore.create(synced);
    goto("/editor/chart/" + docId);
  };
</script>

<div class="holder">
  <div class="side">
    <h3>Teams</h3>

    <div class="options">
      <div
        on:click={() => selectTeam(null)}
        on:keypress={(e) => e.key == "Enter" && selectTeam(null)}
        tabindex="0"
        role="button"
        class="option"
      >
        Your charts
      </div>
      {#each $user.teams as team}
        <div
          on:click={() => selectTeam(team.id)}
          on:keypress={(e) => e.key == "Enter" && selectTeam(team.id)}
          tabindex="0"
          role="button"
          class="option"
        >
          {team.name}
        </div>
      {/each}
      <div
        on:click={() => addTeam()}
        on:keypress={(e) => e.key == "Enter" && addTeam()}
        tabindex="0"
        role="button"
        class="option"
      >
        <div class="add-option">+ New team</div>
      </div>
    </div>
  </div>

  <div class="side">
    <h3>Charts <button on:click={() => newGraphic(true)}>Create new</button></h3>
    <ul>
      {#await charts then c}
        {#each c as chart}
          <li><a href="/editor/chart/{chart.chartRef}">{chart.name}</a></li>
        {/each}
      {/await}
    </ul>
  </div>
</div>

<style>
  .holder {
    display: flex;
    justify-content: space-between;
  }
  .side {
    box-sizing: border-box;
    margin-left: 2em;
    flex: auto;
  }
  .side:first-child {
    margin-left: 0;
    flex: initial;
  }

  .options {
    width: 240px;
    box-sizing: border-box;
    border: 1px solid var(--detail-color);
    background-color: var(--accent-bg-color);
    border-radius: 0.6em;
    cursor: pointer;
  }
  .option {
    padding-left: 1em;
    padding-right: 1em;
    padding-top: 0.7em;
    padding-bottom: 0.7em;
    border-bottom: 1px solid var(--detail-color);
  }
  .option:last-child {
    border-bottom: 0px solid;
  }
  .add-option {
    text-align: center;
  }
</style>
