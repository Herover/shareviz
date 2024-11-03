<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { notifications } from "$lib/notificationStore";
  import { user } from "$lib/userStore";
  import { db as chartStore } from "$lib/chartStore";

  let teamId: string | undefined;
  $: teamId = $page.params.teamId;
  $: console.log(teamId);
  let charts: { chartRef: string; id: string; name: string }[] = [];
  let team:
    | Awaited<ReturnType<typeof user.getTeamCharts>>
    | undefined;
  $: typeof teamId == "undefined"
    ? user
        .geUserCharts()
        .then((c) => {
          charts = c;
          team = undefined;
        })
        .catch((e) => notifications.addError(e.message))
    : user
        .getTeamCharts(teamId)
        .then((c) => {
          charts = c.charts;
          team = c;
        })
        .catch((e) => notifications.addError(e.message));
  $: console.log(typeof teamId == "undefined", teamId);
  const addTeam = async () => {
    const res = await fetch("/api/team", {
      method: "POST",
      body: JSON.stringify({
        name: "Test",
        organizationId: $page.params.organizationId,
      }),
    });
    const data = await res.json();
    goto(`/org/${$page.params.organizationId}/team/${data.teamId}`);
  };

  // let disconnect = () => {};
  // onDestroy(() => {
  //   disconnect();
  // });
  // $: {
  //   if ($page.data.session?.user) {
  //     disconnect = chartStore.connect();
  //     fetch("/api/chart")
  //       .then((req) => req.json())
  //       .then((data) => (charts = data.charts))
  //       .catch((e) => notifications.addError(e.message));
  //   } else {
  //     disconnect = () => {};
  //   }
  // }

  const newGraphic = async (synced: boolean) => {
    const docId = await chartStore.create(synced);
    goto("/editor/chart/" + docId);
  };
</script>

<div class="holder">
  <div class="side">
    <h3>Teams</h3>

    <div class="options">
      <a class="option" href={`/org/${$page.params.organizationId}/team`}>
        Your charts
      </a>
      {#each $user.teams as team}
        <a
          href={`/org/${$page.params.organizationId}/team/${team.teams.id}`}
          class="option"
        >
          {team.teams.name}
        </a>
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

    {#if team}
      <p>Team <b>{team.name}</b> members:</p>
      <ul>
        {#each team.members as member}
          <li>
            {member.user.name}
            {#if member.role == 2}
              (administrator)
            {/if}
            {#if member.user.id == $page.data.session?.user?.id}
              (you)
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="side">
    <h3>
      Charts <button on:click={() => newGraphic(true)}>Create new</button>
    </h3>
    <ul>
      {#each charts as chart}
        <li><a href="/editor/chart/{chart.chartRef}">{chart.name}</a></li>
      {/each}
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
  a.option {
    width: 100%;
    height: 100%;
    display: inline-block;
    box-sizing: border-box;
  }
  .add-option {
    text-align: center;
  }
</style>
