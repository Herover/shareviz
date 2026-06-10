<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- A single member row: avatar, name (+ "You" badge), optional email, a role
     pill and an optional remove button (shown only when `onRemove` is given).
     Rows are meant to be stacked directly inside a flush card body. -->

<script lang="ts">
  import Icon from "../Icon.svelte";
  import Pill from "../Pill.svelte";
  import UserBadge from "../chart/UserBadge.svelte";

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
  <!-- <Avatar {name} {id} /> -->
  <div class="avatar">
    <UserBadge user={{ id, name: name ?? "" }} fill />
  </div>
  <div class="member-id">
    <div class="member-name">
      {name ?? "Unknown user"}
      {#if isYou}<Pill mono uppercase tone="secondary">You</Pill>{/if}
    </div>
    {#if email}<div class="member-email">{email}</div>{/if}
  </div>
  {#if isAdmin}
    <Pill variant="solid" tone="primary" size="md">{roleLabel}</Pill>
  {:else}
    <Pill variant="outline" size="md">{roleLabel}</Pill>
  {/if}
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
  .member-email {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--fg-tertiary);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
  .avatar {
    height: 38px;
    width: 38px;
    font-size: 24px;
  }
</style>
