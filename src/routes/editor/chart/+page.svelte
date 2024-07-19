<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/userStore";
  import { db } from "$lib/chartStore";
  import { onDestroy } from "svelte";
  import { notifications } from "$lib/notificationStore";

  let username = "";
  let password = "";

  const disconnect = db.connect();
  onDestroy(() => {
    disconnect();
  });

  const charts = db.getRecent();

  const newGraphic = async (synced: boolean) => {
    const docId = await db.create(synced);
    goto("/editor/chart/" + docId);
  };
  const authenticate = async () => {
    if ($user.signedIn) {
      await user.signOut();
    } else {
      const res = await user.signIn(username, password);
      if (res) {
        username = "";
        password = "";
      }
    }
  };

  const newUser = async () => {
    const result = await user.createUser(username, password);
    if (!result) {
      notifications.addError("Unable to create this user");
    } else {
      notifications.addInfo("User created, you can log in now");
    }
  }
</script>

<div class="main">
  <div class="holder">
    <div class="container">
      <h1>Welcome {$user.username}</h1>
      {#if !$user.signedIn}
        <input bind:value={username} placeholder="username" />
        <input bind:value={password} placeholder="password" type="password" />
      {/if}
      <button on:click={() => authenticate()}>
        {#if $user.signedIn}
          Sign out
        {:else}
          Sign in
        {/if}
      </button>
      {#if !$user.signedIn}
        <button on:click={() => newUser()}>Create user</button>
      {/if}
      <br /><br />
      {#if $user.signedIn}
        <button on:click={() => newGraphic(true)}>New graphic</button>
      {/if}
      <button on:click={() => newGraphic(false)}>New local graphic</button>
      {#await charts}
        ...
      {:then chartList}
        {#each chartList as chart}
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
  input {
    width: 30%;
  }
</style>
