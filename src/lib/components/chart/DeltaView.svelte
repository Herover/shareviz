<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { RichText } from "$lib/chart";
  import { deltaToLines, groupLines, toDelta, type BlockType, type Line } from "./richText";

  interface Props {
    /** A document Delta (only insert ops). */
    delta: RichText | undefined;
    /** Block type for lines that carry no explicit `block` attribute (legacy data). */
    defaultBlock?: BlockType;
  }

  let { delta, defaultBlock = "p" }: Props = $props();

  // Split the Delta into block-typed lines of inline segments, then group consecutive list
  // lines. Rendering text via {text} (never {@html}) keeps this XSS-safe regardless of input.
  let lines = $derived(deltaToLines(toDelta(delta), defaultBlock));
  let groups = $derived(groupLines(lines));

  let hasContent = $derived(lines.some((line) => line.segments.length > 0));
</script>

{#snippet inline(line: Line)}{#if line.segments.length === 0}<br
    />{:else}{#each line.segments as segment, j (j)}<span
        class:rt-bold={segment.bold}
        class:rt-italic={segment.italic}
        class:rt-underline={segment.underline}>{segment.text}</span
      >{/each}{/if}{/snippet}

{#if hasContent}
  <!-- One block element per line; runs of list lines collapse into one <ul>/<ol>. -->
  {#each groups as group, i (i)}
    {#if group.list}<svelte:element this={group.list} class="rt-list"
        >{#each group.items as item, j (j)}<li class="rt-line">
            {@render inline(item)}
          </li>{/each}</svelte:element
      >{:else}<svelte:element this={group.line.block} class="rt-line"
        >{@render inline(group.line)}</svelte:element
      >{/if}
  {/each}
{/if}

<style>
  /* Block hierarchy. Applies wherever DeltaView is used (editor preview and viewer route). */
  .rt-line {
    font-weight: normal;
    margin: 0.3em 0;
  }
  .rt-line:first-child {
    margin-top: 0;
  }
  .rt-line:last-child {
    margin-bottom: 0;
  }
  h1.rt-line {
    font-size: 2em;
  }
  h2.rt-line {
    font-size: 1.5em;
  }
  p.rt-line {
    font-size: 1em;
  }
  .rt-list {
    margin: 0.3em 0;
    padding-left: 1.5em;
  }
  .rt-list:first-child {
    margin-top: 0;
  }
  .rt-list:last-child {
    margin-bottom: 0;
  }
  .rt-list .rt-line {
    margin: 0;
    font-size: 1em;
  }
  .rt-bold {
    font-weight: bold;
  }
  .rt-italic {
    font-style: italic;
  }
  .rt-underline {
    text-decoration: underline;
  }
</style>
