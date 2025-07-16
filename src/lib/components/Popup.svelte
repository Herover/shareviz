<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    show: boolean;
    children: Snippet;
    onDismiss: () => void;
  }

  let { show, children, onDismiss }: Props = $props();
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={() => onDismiss()} class="backdrop">
    <div onclick={(e) => e.stopPropagation()} class="content">
      <div style="width:100%"></div>
      {@render children()}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #000000aa;
    z-index: 90;
  }
  .content {
    max-width: 600px;
    width: 100%;
    min-height: 300px;
    background-color: var(--main-bg-color);
    padding-left: 1em;
    padding-right: 1em;
  }
</style>
