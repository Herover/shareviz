<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  let {
    value = $bindable(),
    onchange = () => {},
    documentation = true,
  }: {
    value?: string;
    onchange?: (value: string) => void;
    documentation?: boolean;
  } = $props();
</script>

<p>
  <label>
    Format
    <input
      bind:value
      onchange={(e) => onchange(e.currentTarget.value)}
      onkeyup={(e) => onchange(e.currentTarget.value)}
    />
  </label>
</p>
{#if documentation}
  <div class="editor-sub-section-description">
    <pre>YYYY-MM-DD</pre>
    2025-02-10<br />
    <pre>YY/M/D</pre>
    25/02/10<br />
    <pre>HH:mm:s</pre>
    13:02:30<br />
    <pre>hh a</pre>
    2 pm<br />
    <pre>YYYY[Q]Q</pre>
    2025Q1
    <p>See more at <a href="https://day.js.org/docs/en/parse/string-format">Day.js docs</a></p>
  </div>
{/if}

<style>
  pre {
    display: inline-block;
    margin: 0;
  }
</style>
