<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- A single member row: avatar, name (+ "You" badge), optional email, a role
     pill and an optional remove button (shown only when `onRemove` is given).
     Rows are meant to be stacked directly inside a flush card body. -->

<script lang="ts">
  import Avatar from "./Avatar.svelte";
  import Icon from "../Icon.svelte";

  interface Props {
    id: string;
    name: string | null;
    email?: string | null;
    roleLabel: string;
    isAdmin?: boolean;
    isYou?: boolean;
    onRemove?: () => void;
  }
  let { id, name, email, roleLabel, isAdmin = false, isYou = false, onRemove }: Props = $props();
</script>

<div class="member" class:removable={onRemove}>
  <Avatar {name} {id} />
  <div class="member-id">
    <div class="member-name">
      {name ?? "Unknown user"}
      {#if isYou}<span class="you-badge">You</span>{/if}
    </div>
    {#if email}<div class="member-email">{email}</div>{/if}
  </div>
  <span class="role-pill" class:is-admin={isAdmin}>{roleLabel}</span>
  {#if onRemove}
    <button
      class="member-remove"
      title="Remove"
      aria-label="Remove {name}"
      onclick={() => onRemove?.()}
    >
      <Icon name="x" size={16} />
    </button>
  {/if}
</div>

<style>
  .member {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 24px;
    border-bottom: 1px solid var(--border-subtle);
    transition: background var(--duration-micro) var(--ease-standard);
  }
  .member:last-child {
    border-bottom: 0;
  }
  .member:hover {
    background: var(--bg-base);
  }
  .member-id {
    min-width: 0;
    flex: 1;
  }
  .member-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--fg-primary);
  }
  .you-badge {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent-secondary);
    background: var(--accent-secondary-subtle);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
  }
  .member-email {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--fg-tertiary);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .role-pill {
    flex-shrink: 0;
    height: 30px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    color: var(--fg-secondary);
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 500;
  }
  .role-pill.is-admin {
    color: var(--fg-on-accent);
    border-color: var(--accent-primary);
    background-color: var(--accent-primary);
  }
  .member-remove {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--fg-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    opacity: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      opacity var(--duration-micro),
      background var(--duration-micro),
      color var(--duration-micro);
  }
  .member.removable:hover .member-remove,
  .member-remove:focus-visible {
    opacity: 1;
  }
  .member-remove:hover {
    background: var(--state-error-bg);
    color: var(--state-error);
  }
</style>
