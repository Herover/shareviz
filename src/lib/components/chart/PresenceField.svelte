<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    PresenceAddress,
    PresenceData,
    ShareDBConnection,
  } from "$lib/chartStores/data.svelte";
  import UserBadge from "./UserBadge.svelte";

  interface Props {
    /** Stable, id-based address of the field this wrapper guards. */
    address: PresenceAddress;
    connection: ShareDBConnection | undefined;
    /** Renders the actual input; `locked` is true while a remote editor occupies the field. */
    field: Snippet<[{ locked: boolean; editors: PresenceData[] }]>;
    /** Use inline-block so the wrapper sits inline among other controls in a row. */
    inline?: boolean;
  }

  let { address, connection, field, inline = false }: Props = $props();

  let editors = $derived(connection?.editorsAt(address) ?? []);
  // Identity of the current occupant set; changes when editors join or leave.
  let editorKey = $derived(
    editors
      .map((e) => e.id)
      .sort()
      .join(","),
  );

  // "Edit anyway" records the occupant set we chose to override. A new or changed
  // occupant re-arms the lock automatically, so no $effect is needed.
  let overriddenKey = $state("");

  let locked = $derived(editors.length > 0 && overriddenKey !== editorKey);
  let lockColor = $derived(editors[0]?.color || "var(--accent-secondary)");

  const onfocusin = () => connection?.setLocalSelection(address);
  const onfocusout = (e: FocusEvent) => {
    // Only clear when focus actually leaves the wrapper, not when moving within it.
    const wrapper = e.currentTarget as HTMLElement;
    if (!wrapper.contains(e.relatedTarget as Node | null)) {
      connection?.setLocalSelection(null);
    }
  };
</script>

<div
  class="presence-field"
  class:is-occupied={editors.length > 0}
  class:inline
  style:--presence-color={lockColor}
  {onfocusin}
  {onfocusout}
>
  {@render field({ locked, editors })}

  {#if editors.length > 0}
    <div class="presence-badges" title={editors.map((e) => e.name).join(", ")}>
      {#each editors as editor (editor.id)}
        <UserBadge user={editor} />
      {/each}
      {#if locked}
        <button type="button" class="presence-override" onclick={() => (overriddenKey = editorKey)}>
          Edit anyway
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .presence-field {
    position: relative;
  }
  .presence-field.inline {
    display: inline-block;
  }
  .presence-field.is-occupied {
    outline: 2px solid var(--presence-color);
    outline-offset: 1px;
    border-radius: 3px;
  }
  .presence-badges {
    position: absolute;
    top: -0.7em;
    left: 0em;
    display: flex;
    align-items: left;
    z-index: 2;
    pointer-events: none;
  }
  .presence-override {
    pointer-events: auto;
    font-size: 0.7em;
    padding: 0.1em 0.4em;
    border: 1px solid var(--border-default);
    border-radius: 3px;
    background-color: var(--bg-surface);
    color: var(--fg-secondary);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--duration-standard);
  }
  .presence-field:hover .presence-override {
    opacity: 1;
  }
</style>
