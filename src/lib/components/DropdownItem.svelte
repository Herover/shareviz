<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { getContext, type Snippet } from "svelte";

  interface Props {
    onClick: () => void;
    icon?: Snippet;
    label: string;
    danger?: boolean;
    disabled?: boolean;
  }

  let { onClick, icon, label, danger = false, disabled = false }: Props = $props();

  // Auto-close the enclosing DropdownButton after the click handler runs.
  const closeMenu = getContext<() => void>("dropdown-close");

  const handleClick = () => {
    onClick();
    closeMenu?.();
  };
</script>

<button
  type="button"
  role="menuitem"
  class="dropdown-item"
  class:is-danger={danger}
  {disabled}
  onclick={handleClick}
>
  {#if icon}
    <span class="dropdown-item-icon">{@render icon()}</span>
  {/if}
  <span>{label}</span>
</button>

<style>
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--fg-primary);
    cursor: pointer;
    background: transparent;
    border: 0;
    width: 100%;
    text-align: left;
    height: auto;
  }
  .dropdown-item:hover:not([disabled]) {
    background: var(--bg-base);
  }
  .dropdown-item[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .dropdown-item-icon {
    color: var(--fg-tertiary);
    display: inline-flex;
  }
  .dropdown-item:hover:not([disabled]) .dropdown-item-icon {
    color: var(--fg-secondary);
  }
  .dropdown-item.is-danger {
    color: var(--state-error);
  }
  .dropdown-item.is-danger .dropdown-item-icon {
    color: var(--state-error);
  }
  .dropdown-item.is-danger:hover:not([disabled]) {
    background: var(--state-error-bg);
  }
</style>
