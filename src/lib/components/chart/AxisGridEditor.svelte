<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { AxisGridStore } from "$lib/chartStores/axis.svelte";
  import type { PresenceAddress, ShareDBConnection } from "$lib/chartStores/data.svelte";
  import PresenceField from "./PresenceField.svelte";

  interface Props {
    conf: AxisGridStore;
    connection: ShareDBConnection | undefined;
    /** Stable, id-based address prefix for this grid, e.g. [...axis,"major"]. */
    address: PresenceAddress;
    isMinor?: boolean;
    idPrefix?: string;
  }

  let { conf, connection, address, isMinor = false, idPrefix = "" }: Props = $props();
</script>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}grid-enabled">Enabled</label>
  </div>
  <div>
    <PresenceField address={[...address, "enabled"]} {connection}>
      {#snippet field({ locked })}
        <input
          id="{idPrefix}grid-enabled"
          checked={conf.data.enabled}
          disabled={locked}
          onchange={(e) => conf.setEnabled(e.currentTarget.checked)}
          type="checkbox"
        />
      {/snippet}
    </PresenceField>
  </div>
</div>

{#if conf.data.enabled}
  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-grid">Grid</label>
    </div>
    <div>
      <PresenceField address={[...address, "grid"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="{idPrefix}grid-grid"
            checked={conf.data.grid}
            disabled={locked}
            onchange={(e) => conf.setGrid(e.currentTarget.checked)}
            type="checkbox"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-tick-size">Label tick size</label>
    </div>
    <div>
      <PresenceField address={[...address, "tickSize"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="{idPrefix}grid-tick-size"
            value={conf.data.tickSize}
            readonly={locked}
            onchange={(e) => conf.setTickSize(Number.parseFloat(e.currentTarget.value))}
            type="number"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-tick-width">Label tick width</label>
    </div>
    <div>
      <PresenceField address={[...address, "tickWidth"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="{idPrefix}grid-tick-width"
            value={conf.data.tickWidth}
            readonly={locked}
            onchange={(e) => conf.setTickWidth(Number.parseFloat(e.currentTarget.value))}
            type="number"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="{idPrefix}grid-auto-from">Auto ticks from</label>
    </div>
    <div>
      <PresenceField address={[...address, "auto", "from"]} {connection} inline>
        {#snippet field({ locked })}
          <input
            id="{idPrefix}grid-auto-from"
            type="number"
            value={conf.data.auto.from}
            readonly={locked}
            onchange={(e) => conf.setAutoFrom(e.currentTarget.value)}
            style="width: 80px;"
          />
        {/snippet}
      </PresenceField>
      <label for="{idPrefix}grid-auto-each">every</label>
      <PresenceField address={[...address, "auto", "each"]} {connection} inline>
        {#snippet field({ locked })}
          <input
            id="{idPrefix}grid-auto-each"
            value={conf.data.auto.each}
            readonly={locked}
            onchange={(e) => conf.setAutoEach(Number.parseFloat(e.currentTarget.value))}
            type="number"
            style="width: 80px;"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if !isMinor}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="{idPrefix}grid-auto-label">Auto label</label>
      </div>
      <div>
        <PresenceField address={[...address, "auto", "labels"]} {connection} inline>
          {#snippet field({ locked })}
            <input
              id="{idPrefix}grid-auto-label"
              checked={conf.data.auto.labels}
              disabled={locked}
              onchange={(e) => conf.setAutoLabels(e.currentTarget.checked)}
              type="checkbox"
            />
          {/snippet}
        </PresenceField>
        <PresenceField address={[...address, "labelDivide"]} {connection} inline>
          {#snippet field({ locked })}
            <select
              value={conf.data.labelDivide}
              disabled={locked}
              onchange={(e) => conf.setLabelDivide(Number.parseFloat(e.currentTarget.value))}
              style="width: 80px;"
            >
              {#each [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000] as n (n)}
                <option>{n}</option>
              {/each}
            </select>
          {/snippet}
        </PresenceField>
        <label for="{idPrefix}grid-after-label">after</label>
        <PresenceField address={[...address, "afterLabel"]} {connection} inline>
          {#snippet field({ locked })}
            <input
              id="{idPrefix}grid-after-label"
              type="text"
              value={conf.data.afterLabel}
              readonly={locked}
              onchange={(e) => conf.setAfterLabel(e.currentTarget.value)}
              style="width: 80px;"
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    <p>
      Manual marks
      <br />
      {#each conf.data.ticks as kv, i (i)}
        <label>
          Value
          <PresenceField address={[...address, "ticks", i, "n"]} {connection} inline>
            {#snippet field({ locked })}
              <input
                value={kv.n}
                readonly={locked}
                onchange={(e) => conf.setTickValue(i, Number.parseFloat(e.currentTarget.value))}
                type="number"
                style="width: 80px;"
              />
            {/snippet}
          </PresenceField>
        </label>
        <label>
          Text
          <PresenceField address={[...address, "ticks", i, "l"]} {connection} inline>
            {#snippet field({ locked })}
              <input
                value={kv.l}
                readonly={locked}
                onchange={(e) => conf.setTickLabel(i, e.currentTarget.value)}
                type="text"
                style="width: 80px;"
              />
            {/snippet}
          </PresenceField>
        </label>
        <button onclick={() => conf.removeTick(i)}>delete</button>
        <br />
      {/each}
      <button onclick={() => conf.addTick(conf.data.ticks.length)}>+ add</button>
    </p>
  {/if}
{/if}
