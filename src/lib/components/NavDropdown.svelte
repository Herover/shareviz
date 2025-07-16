<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  let { children }: { children: import("svelte").Snippet } = $props();
  let open = $state(false);
  let container: HTMLDivElement | undefined = $state();

  let opened = $state(0);
  const isInContainer = (el: HTMLElement | null) => {
    if (!el) {
      return false;
    }
    if (el !== container) {
      return isInContainer(el.parentElement);
    }
    return true;
  };
  let ev = (e: MouseEvent | KeyboardEvent) => {
    if (
      // If click happens at same time as opening, it was the click that opened us.
      opened < Date.now() &&
      !isInContainer(e.target as HTMLElement)
    ) {
      open = false;
    } else if (e instanceof KeyboardEvent && e.code == "Escape") {
      open = false;
    }
  };
  const toggleOpen = () => {
    open = !open;

    if (open) {
      opened = Date.now() + 100;
      document.addEventListener("click", ev);
      document.addEventListener("keyup", ev);
    } else {
      document.removeEventListener("click", ev);
      document.removeEventListener("keyup", ev);
    }
  };
</script>

<div class="nav-dropdown">
  <div
    onclick={() => toggleOpen()}
    onkeydown={(e) => e.key == " " && toggleOpen()}
    role="button"
    tabindex="0"
    class="nav-dropdown-arrow"
  >
    {#if open}
      ▲
    {:else}
      ▼
    {/if}
  </div>
  {#if open}
    <div bind:this={container} class="nav-dropdown-view">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .nav-dropdown {
    display: inline-block;
  }
  .nav-dropdown .nav-dropdown-view {
    position: absolute;
    top: 2em;
    translate: calc(-100% + 1rem) 0%;
  }
</style>
