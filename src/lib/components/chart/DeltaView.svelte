<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { RichText } from "$lib/chart";
  import { deltaToLines, toDelta } from "./richText";

  interface Props {
    /** A document Delta (only insert ops). */
    delta: RichText | undefined;
  }

  let { delta }: Props = $props();

  // Split the Delta into lines of formatted inline segments. Rendering text via {text}
  // (never {@html}) keeps this XSS-safe regardless of what was typed.
  let lines = $derived(deltaToLines(toDelta(delta)));

  let hasContent = $derived(lines.some((line) => line.length > 0));
</script>

{#if hasContent}
  <!-- Rendered inline (lines split by <br>) so it can sit inside an <h1>/<p>. -->
  {#each lines as line, i (i)}
    {#if i > 0}<br />{/if}{#each line as segment, j (j)}<span
        class:rt-bold={segment.bold}
        class:rt-italic={segment.italic}
        class:rt-underline={segment.underline}>{segment.text}</span
      >{/each}
  {/each}
{/if}

<style>
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
