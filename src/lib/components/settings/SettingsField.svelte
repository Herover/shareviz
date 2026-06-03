<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- A labelled form row (label + optional sub-label on the left, control on the
     right). The control is provided as children; this component styles the
     standard inputs/textareas placed inside it to match the card aesthetic. -->

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    sub?: string;
    controlId?: string;
    children: Snippet;
  }
  let { label, sub, controlId, children }: Props = $props();
</script>

<div class="field">
  <label class="label" for={controlId}>
    {label}
    {#if sub}<span class="sub">{sub}</span>{/if}
  </label>
  <div class="control">
    {@render children()}
  </div>
</div>

<style>
  .field {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    gap: 6px 24px;
    align-items: start;
    padding-bottom: 16px;
  }
  .field:last-child {
    padding-bottom: 0;
  }
  @media (max-width: 560px) {
    .field {
      grid-template-columns: 1fr;
    }
  }
  .label {
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 500;
    color: var(--fg-primary);
    padding-top: 9px;
  }
  .sub {
    display: block;
    font-weight: 400;
    font-size: 0.8rem;
    color: var(--fg-tertiary);
    margin-top: 2px;
    line-height: 1.4;
  }
  .control {
    min-width: 0;
  }

  /* Style the standard controls dropped into the field. */
  .control :global(input[type="text"]),
  .control :global(textarea) {
    width: 100%;
    max-width: 420px;
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--fg-primary);
    font-family: var(--font-body);
    font-size: 0.95rem;
    outline: none;
    transition: border-color var(--duration-micro) var(--ease-standard);
  }
  .control :global(input[type="text"]:focus),
  .control :global(textarea:focus) {
    border-color: var(--border-focus);
  }
  .control :global(input[type="text"]:disabled),
  .control :global(textarea:disabled) {
    background: var(--bg-sunken);
    color: var(--fg-tertiary);
    cursor: not-allowed;
  }
  .control :global(textarea) {
    height: auto;
    min-height: 64px;
    padding: 8px 10px;
    resize: vertical;
    line-height: 1.5;
  }
  .control :global(.field-help) {
    font-size: 0.8rem;
    color: var(--fg-tertiary);
    margin: 6px 0 0;
    line-height: 1.45;
  }
</style>
