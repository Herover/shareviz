<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { setContext, type Snippet } from "svelte";

  interface Props {
    label: string;
    /**
     * If provided, the button acts as a split button: clicking the label runs
     * this handler directly, and only the chevron half opens the dropdown.
     * If absent, the whole button toggles the dropdown.
     */
    onClick?: () => void;
    chevronAriaLabel?: string;
    leadingIcon?: Snippet;
    children: Snippet;
  }

  let {
    label,
    onClick,
    chevronAriaLabel = "More options",
    leadingIcon,
    children,
  }: Props = $props();

  let open = $state(false);
  let container: HTMLDivElement | undefined = $state();
  let openedAt = 0;

  const isSplit = $derived(typeof onClick === "function");

  const isInContainer = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    if (el === container) return true;
    return isInContainer(el.parentElement);
  };

  const onDocEvent = (e: MouseEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent) {
      if (e.code === "Escape") close();
      return;
    }
    if (openedAt < Date.now() && !isInContainer(e.target as HTMLElement)) {
      close();
    }
  };

  const open_ = () => {
    open = true;
    openedAt = Date.now() + 100;
    document.addEventListener("click", onDocEvent);
    document.addEventListener("keyup", onDocEvent);
  };

  const close = () => {
    open = false;
    document.removeEventListener("click", onDocEvent);
    document.removeEventListener("keyup", onDocEvent);
  };

  const toggle = () => {
    if (open) close();
    else open_();
  };

  // Items inside the panel call this after their onClick so the menu closes.
  setContext<() => void>("dropdown-close", () => close());
</script>

<div class="dropdown-wrap" bind:this={container}>
  {#if isSplit}
    <div class="dropdown-split">
      <button type="button" class="dropdown-main btn-primary" onclick={onClick}>
        {#if leadingIcon}{@render leadingIcon()}{/if}
        <span>{label}</span>
      </button>
      <button
        type="button"
        class="dropdown-chev-btn"
        class:open
        aria-label={chevronAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onclick={toggle}
      >
        <svg
          class="dropdown-chev"
          class:open
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  {:else}
    <button
      type="button"
      class="dropdown-trigger"
      aria-haspopup="menu"
      aria-expanded={open}
      onclick={toggle}
    >
      {#if leadingIcon}{@render leadingIcon()}{/if}
      <span>{label}</span>
      <svg
        class="dropdown-chev"
        class:open
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  {/if}
  {#if open}
    <div class="dropdown-panel" role="menu" tabindex="-1">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .dropdown-wrap {
    position: relative;
    display: inline-flex;
  }

  /* Shared button look — solid accent fill, theme-stable */
  .dropdown-trigger,
  .dropdown-main,
  .dropdown-chev-btn {
    height: 34px;
    display: inline-flex;
    align-items: center;
    background: var(--accent-primary);
    color: var(--fg-on-accent);
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    border: 0;
    transition: background var(--duration-micro) var(--ease-standard);
  }

  /* Single-trigger mode */
  .dropdown-trigger {
    padding: 0 12px;
    gap: 6px;
    border-radius: var(--radius-md);
    border: 1px solid var(--accent-primary);
  }
  .dropdown-trigger:hover {
    background: var(--accent-primary-hover);
    border-color: var(--accent-primary-hover);
  }
  .dropdown-trigger[aria-expanded="true"] {
    background: var(--accent-primary-press);
    border-color: var(--accent-primary-press);
  }

  /* Split-button shell — single rounded outline wraps both halves so the
     seam between them is a single 1px line, not two stacked borders. */
  .dropdown-split {
    display: inline-flex;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 0 0 1px var(--accent-primary);
  }

  /* Left half — the primary action */
  .dropdown-main {
    padding: 0 14px;
    gap: 6px;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }
  .dropdown-main:hover {
    background: var(--accent-primary-hover);
  }

  /* Right half — chevron-only, opens the menu. */
  .dropdown-chev-btn {
    padding: 0 9px;
    justify-content: center;
    border-left: 1px solid var(--color-terra-600);
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }
  .dropdown-chev-btn:hover {
    background: var(--accent-primary-hover);
  }
  .dropdown-chev-btn.open {
    background: var(--accent-primary-press);
  }

  .dropdown-chev {
    transition: transform var(--duration-micro) var(--ease-standard);
  }
  .dropdown-chev.open {
    transform: rotate(180deg);
  }

  .dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 220px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-2);
    z-index: 25;
    padding: 6px;
    display: flex;
    flex-direction: column;
  }
</style>
