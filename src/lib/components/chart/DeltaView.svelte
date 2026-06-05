<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { RichText } from "$lib/chart";
  import { deltaToLines, toDelta, type BlockType } from "./richText";

  interface Props {
    /** A document Delta (only insert ops). */
    delta: RichText | undefined;
    /** Block type for lines that carry no explicit `block` attribute (legacy data). */
    defaultBlock?: BlockType;
  }

  let { delta, defaultBlock = "p" }: Props = $props();

  // Split the Delta into block-typed lines of inline segments. Rendering text via {text}
  // (never {@html}) keeps this XSS-safe regardless of what was typed.
  let lines = $derived(deltaToLines(toDelta(delta), defaultBlock));

  let hasContent = $derived(lines.some((line) => line.segments.length > 0));
</script>

{#if hasContent}
  <!-- One block element (h1/h2/p) per line, mirroring the editor's block model. -->
  {#each lines as line, i (i)}
    <svelte:element this={line.block} class="rt-line"
      >{#if line.segments.length === 0}<br />{:else}{#each line.segments as segment, j (j)}<span
            class:rt-bold={segment.bold}
            class:rt-italic={segment.italic}
            class:rt-underline={segment.underline}>{segment.text}</span
          >{/each}{/if}</svelte:element
    >
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
