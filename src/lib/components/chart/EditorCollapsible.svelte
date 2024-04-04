<script lang="ts">
  export let group: string | number;
  export let key: string | number;
  export let label: string;
  export let startOpen: boolean = false;
  export let lvl = 1;

  let open = startOpen || false;
</script>

<div class="container">
  <button
    class:header-open={open}
    on:click={() => (open = !open)}
    class="header"
  >
    <!-- h3 is technically not allowed inside a button, but appears like the most accessible solution if we want a
      clickable header -->
    {#if lvl == 1}
      <h3>{open ? "-" : "+"} {label}</h3>
    {:else if lvl == 2}
      <h4>{open ? "-" : "+"} {label}</h4>
    {/if}
  </button>
  <div class="content">
    {#if open}
      <slot />
    {/if}
  </div>
</div>

<style>
  .container {
    width: 100%;
  }
  .header {
    border: none;
    background-color: transparent;
    text-align: start;
    width: 100%;
    border-bottom: 1px solid black;
  }
  .content {
    width: 100%;
  }
  h3,
  h4 {
    margin: 0px;
    padding-top: 1em;
  }
</style>
