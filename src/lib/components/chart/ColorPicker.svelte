<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let color: string;

  let open = false;
  let input: HTMLInputElement | undefined;

  $: if (open) input?.focus();

  const dispatch = createEventDispatcher<{ change: string }>();
</script>

<div class="holder">
  <div
    style:background-color={color}
    on:click={() => (open = !open)}
    on:keydown={() => (open = !open)}
    class="color-display"
    role="button"
    tabindex="0"
  ></div>
  {#if open}
    <div class="popout">
      <input
        value={color}
        bind:this={input}
        on:change={(e) => dispatch("change", e.currentTarget.value)}
        on:keyup={(e) => dispatch("change", e.currentTarget.value)}
        on:focusout={() => (open = false)}
      />
    </div>
  {/if}
</div>

<style>
  .popout {
    position: absolute;
    top: 100%;
    left: calc(-50px + 50% - 16px);
    width: 100px;
    border: 2px solid black;
    background-color: #ffffff;
    margin: 8px;
    padding: 8px;
    /* border-radius: 8px; */
  }
  .popout input {
    box-sizing: border-box;
    width: 100%;
  }
  .holder {
    position: relative;
    width: 1em;
    height: 1em;
    display: inline-block;
  }
  .color-display {
    width: 100%;
    height: 100%;
  }
</style>
