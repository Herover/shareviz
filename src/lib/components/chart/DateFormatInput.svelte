<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  interface Props {
    value: string;
    onValueChange: (next: string) => void;
    id?: string;
  }

  let { value, onValueChange, id }: Props = $props();

  const DATE_FORMAT_HINTS: [string, string][] = [
    ["YYYY-MM-DD", "2025-02-10"],
    ["YY/M/D", "25/2/10"],
    ["HH:mm:s", "13:02:30"],
    ["hh a", "2 pm"],
    ["YYYY[Q]Q", "2025Q1"],
  ];
</script>

<div class="date-fmt">
  <input
    {id}
    type="text"
    placeholder="e.g. YYYY-MM-DD"
    {value}
    onchange={(e) => onValueChange(e.currentTarget.value)}
    onkeyup={(e) => onValueChange(e.currentTarget.value)}
  />
  <div class="date-hint">
    {#each DATE_FORMAT_HINTS as [fmt, ex] (fmt)}
      <div class="date-hint-row">
        <span class="date-fmt-key">{fmt}</span>
        <span class="date-ex">→ {ex}</span>
      </div>
    {/each}
    <a
      href="https://day.js.org/docs/en/parse/string-format"
      class="date-hint-link"
      target="_blank"
      rel="noreferrer"
    >
      See all formats at Day.js docs →
    </a>
  </div>
</div>

<style>
  .date-fmt {
    padding: 8px 0 4px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .date-fmt input[type="text"] {
    height: 28px;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    max-width: 220px;
  }
  .date-hint {
    background: var(--bg-deep);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 280px;
  }
  .date-hint-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }
  .date-fmt-key {
    color: var(--accent-primary);
    font-weight: 500;
    min-width: 90px;
  }
  .date-ex {
    color: var(--fg-on-deep-muted);
  }
  .date-hint-link {
    margin-top: 6px;
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--fg-on-deep-muted);
    text-decoration: none;
  }
  .date-hint-link:hover {
    text-decoration: underline;
    color: var(--fg-on-deep);
  }
</style>
