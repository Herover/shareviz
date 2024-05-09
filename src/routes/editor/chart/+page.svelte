<script lang="ts">
    import { goto } from "$app/navigation";
  import { db } from "$lib/chartStore";
  import { onDestroy } from "svelte";

  const disconnect = db.connect();
  onDestroy(() => {
    disconnect();
  });

  const charts = db.getRecent();

  const newGraphic = async () => {
    const docId = await db.create();
    goto("/editor/chart/" + docId);
  };
  const authenticate = async () => {
    return db.auth("1", "1");
  };
</script>

<div class="main">
  <div class="holder">
    <div class="container">
      <h1>Welcome</h1>
      <button on:click={() => newGraphic()}>New graphic</button>
      <button on:click={() => authenticate()}>Sign in</button>

      {#await charts}
        ...
      {:then chartList} 
        {#each chartList as chart, i}
          <p><a href="/editor/chart/{chart.id}">{chart.data.chart.title}</a></p>
        {/each}
      {/await}
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