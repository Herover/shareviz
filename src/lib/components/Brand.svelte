<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- DataTortilla logo lockup (tortilla mark + wordmark). Reused across app chrome. -->

<script lang="ts">
  import type { Component } from "svelte";
  import TortillaMark from "./brand/TortillaMark.svelte";
  import type { MarkProps } from "./brand/marks";

  interface Props {
    /** When set, the lockup renders as a link. */
    href?: string;
    /** Pixel size of the tortilla mark. */
    size?: number;
    /** Icon mark to render. Defaults to the current tortilla mark. */
    mark?: Component<MarkProps>;
    /** Optional real data, forwarded to data-driven marks. */
    data?: number[];
  }

  let { href, size = 22, mark, data }: Props = $props();

  let Mark = $derived(mark ?? TortillaMark);
</script>

{#snippet lockup()}
  <Mark {size} {data} />
  <span class="brand-text">Data<span class="b-tortilla">Tortilla</span></span>
{/snippet}

{#if href}
  <a class="brand" {href}>{@render lockup()}</a>
{:else}
  <span class="brand">{@render lockup()}</span>
{/if}

<style>
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--fg-primary);
    text-decoration: none;
    letter-spacing: -0.01em;
  }
  .brand:hover {
    color: var(--fg-primary);
  }
  .b-tortilla {
    color: var(--accent-primary);
  }
</style>
