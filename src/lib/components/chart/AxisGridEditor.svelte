<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { AxisGridStore } from "$lib/chartStores/axis.svelte";

  interface Props {
    conf: AxisGridStore;
    isMinor?: boolean;
    idPrefix?: string;
  }

  let { conf, isMinor = false, idPrefix = "" }: Props = $props();
</script>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}grid-enabled">Enabled</label>
  </div>
  <div>
    <input
      id="{idPrefix}grid-enabled"
      checked={conf.data.enabled}
      onchange={(e) => conf.setEnabled(e.currentTarget.checked)}
      type="checkbox"
    />
  </div>
</div>

{#if conf.data.enabled}
  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-grid">Grid</label>
    </div>
    <div>
      <input
        id="{idPrefix}grid-grid"
        checked={conf.data.grid}
        onchange={(e) => conf.setGrid(e.currentTarget.checked)}
        type="checkbox"
      />
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-tick-size">Label tick size</label>
    </div>
    <div>
      <input
        id="{idPrefix}grid-tick-size"
        value={conf.data.tickSize}
        onchange={(e) => conf.setTickSize(Number.parseFloat(e.currentTarget.value))}
        type="number"
      />
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-tick-width">Label tick width</label>
    </div>
    <div>
      <input
        id="{idPrefix}grid-tick-width"
        value={conf.data.tickWidth}
        onchange={(e) => conf.setTickWidth(Number.parseFloat(e.currentTarget.value))}
        type="number"
      />
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-auto-from">Auto ticks from</label>
    </div>
    <div>
      <input
        id="{idPrefix}grid-auto-from"
        type="number"
        value={conf.data.auto.from}
        onchange={(e) => conf.setAutoFrom(e.currentTarget.value)}
        style="width: 80px;"
      />
      <label for="{idPrefix}grid-auto-each">every</label>
      <input
        id="{idPrefix}grid-auto-each"
        value={conf.data.auto.each}
        onchange={(e) => conf.setAutoEach(Number.parseFloat(e.currentTarget.value))}
        type="number"
        style="width: 80px;"
      />
    </div>
  </div>

  {#if !isMinor}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="{idPrefix}grid-auto-label">Auto label</label>
      </div>
      <div>
        <input
          id="{idPrefix}grid-auto-label"
          checked={conf.data.auto.labels}
          onchange={(e) => conf.setAutoLabels(e.currentTarget.checked)}
          type="checkbox"
        />
        <select
          value={conf.data.labelDivide}
          onchange={(e) => conf.setLabelDivide(Number.parseFloat(e.currentTarget.value))}
          style="width: 80px;"
        >
          {#each [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000] as n (n)}
            <option>{n}</option>
          {/each}
        </select>
        <label for="{idPrefix}grid-after-label">after</label>
        <input
          id="{idPrefix}grid-after-label"
          type="text"
          value={conf.data.afterLabel}
          onchange={(e) => conf.setAfterLabel(e.currentTarget.value)}
          style="width: 80px;"
        />
      </div>
    </div>

    <p>
      Manual marks
      <br />
      {#each conf.data.ticks as kv, i (i)}
        <label
          >Value <input
            value={kv.n}
            onchange={(e) => conf.setTickValue(i, Number.parseFloat(e.currentTarget.value))}
            type="number"
            style="width: 80px;"
          /></label
        >
        <label
          >Text <input
            value={kv.l}
            onchange={(e) => conf.setTickLabel(i, e.currentTarget.value)}
            type="text"
            style="width: 80px;"
          /></label
        >
        <button onclick={() => conf.removeTick(i)}>delete</button>
        <br />
      {/each}
      <button onclick={() => conf.addTick(conf.data.ticks.length)}>+ add</button>
    </p>
  {/if}
{/if}
