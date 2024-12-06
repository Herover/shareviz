<script lang="ts">
  // In the template, `!open` errors which doesn't make any sense.
  interface Props {
    group: string | number;
    key: string | number;
    label: string;
    startOpen?: boolean;
    lvl?: number;
    actions?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    group,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key,
    label,
    startOpen = false,
    lvl = 1,
    actions,
    children
  }: Props = $props();

  let open = $state(startOpen || false);
</script>

<div class="container">
  <div class="header-content">
    <button
      class:header-open={open}
      onclick={() => (open = !open)}
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
    {@render actions?.()}
  </div>
  <div class="content">
    {#if open}
      {@render children?.()}
    {/if}
  </div>
</div>

<style>
  .container {
    width: 100%;
  }
  .header-content button {
    border: none;
    background-color: transparent;
    text-align: start;
    cursor: pointer;
  }
  .header {
    flex: 1 1 auto;
  }
  .header-content {
    display: flex;
    flex-direction: row;
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
