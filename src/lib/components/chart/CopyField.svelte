<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  interface Props {
    value: string;
    ariaLabel?: string;
  }

  let { value, ariaLabel }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const copy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      }
    } catch {
      // Clipboard may be blocked (e.g. insecure context); the input still lets
      // the user select and copy manually.
    }
    copied = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1400);
  };
</script>

<div class="ed-copy-field">
  <input
    type="text"
    {value}
    readonly
    aria-label={ariaLabel}
    onfocus={(e) => e.currentTarget.select()}
  />
  <button type="button" onclick={copy}>{copied ? "Copied" : "Copy"}</button>
</div>

<style>
  .ed-copy-field {
    display: flex;
    gap: 6px;
    width: 100%;
    align-items: stretch;
  }
  .ed-copy-field input {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    background: var(--bg-base);
  }
  .ed-copy-field button {
    flex-shrink: 0;
  }
</style>
