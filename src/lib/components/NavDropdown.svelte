<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import Icon from "./Icon.svelte";

  interface Props {
    children: import("svelte").Snippet;
    ariaLabel?: string;
  }
  let { children, ariaLabel = "Open menu" }: Props = $props();

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

<div class="nav-dropdown" class:is-open={open}>
  <button
    type="button"
    class="ch-nav-arrow"
    aria-label={ariaLabel}
    aria-expanded={open}
    onclick={() => toggleOpen()}
  >
    <Icon name={open ? "chevronUp" : "chevronDown"} size={12} stroke={2.2} />
  </button>
  {#if open}
    <div bind:this={container} class="nav-dropdown-view">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .nav-dropdown {
    display: inline-flex;
    align-items: stretch;
    height: 100%;
  }
  .ch-nav-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 14px 0 4px;
    cursor: pointer;
    color: var(--fg-tertiary);
    background: transparent;
    border: 0;
    border-radius: 0;
    transition: color var(--duration-micro) var(--ease-standard);
  }
  .ch-nav-arrow:hover {
    color: var(--fg-primary);
    background: transparent;
  }
  .nav-dropdown.is-open .ch-nav-arrow {
    color: var(--accent-primary);
  }
  .nav-dropdown-view {
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    z-index: 50;
  }
</style>
