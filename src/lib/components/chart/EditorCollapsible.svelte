<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts" module>
  let groups: { [key: string]: string | number } = $state({});
</script>

<script lang="ts">
  // In the template, `!open` errors which doesn't make any sense.
  interface Props {
    group?: string | number;
    key: string | number;
    label: string;
    startOpen?: boolean;
    lvl?: number;
    actions?: import("svelte").Snippet;
    children?: import("svelte").Snippet;
  }

  let { group, key, label, startOpen = false, lvl = 1, actions, children }: Props = $props();

  let open = $state(startOpen);

  if (group) {
    if (typeof groups[group] == "undefined") {
      groups[group] = startOpen ? key : "";
    } else {
      groups[group] = startOpen ? key : "";
    }
  }

  $effect(() => {
    if (group) {
      open = groups[group] == key;
    }
  });

  const toggle = () => {
    open = !open;
    if (open && group) {
      groups[group] = key;
    }
  };
</script>

<div class="container">
  <div class="header-content">
    <span
      class:header-open={open}
      onclick={() => toggle()}
      onkeydown={(e) => {
        if (e.key == "Enter" || e.key == " ") {
          e.preventDefault();
          toggle();
        }
      }}
      class="header"
      role="button"
      tabindex="0"
    >
      <!-- h3 is technically not allowed inside a button, but appears like the most accessible solution if we want a
        clickable header -->
      {#if lvl == 1}
        <h3>{open ? "-" : "+"} {label}</h3>
      {:else if lvl == 2}
        <h4>{open ? "-" : "+"} {label}</h4>
      {/if}
    </span>
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
  .header-content [role="button"] {
    border: none;
    background-color: transparent;
    text-align: start;
    cursor: pointer;
  }
  .header-content [role="button"] * {
    font-weight: bold;
  }
  .header {
    flex: 1 1 auto;
  }
  .header-content {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid black;
    padding-top: 1rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    position: sticky;
    top: var(--editor-header-height);
    background-color: var(--accent-bg-color);
  }
  .content {
    width: 100%;
  }
  h3,
  h4 {
    margin: 0px;
    padding-top: 10px;
  }
  h3 {
    font-size: 1.5rem;
  }
</style>
