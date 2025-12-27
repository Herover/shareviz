<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { AxisGridStore } from "$lib/chartStores/axis.svelte";

  interface Props {
    conf: AxisGridStore;
    isMinor?: boolean;
  }

  let { conf, isMinor = false }: Props = $props();
</script>

<p>
  <label>
    Enabled:
    <input
      checked={conf.data.enabled}
      onchange={(e) => conf.setEnabled(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
{#if conf.data.enabled}
  <p>
    <label>
      Grid:
      <input
        checked={conf.data.grid}
        onchange={(e) => conf.setGrid(e.currentTarget.checked)}
        type="checkbox"
      />
    </label>
  </p>

  <p>
    <label>
      Label tick size:
      <input
        value={conf.data.tickSize}
        onchange={(e) => conf.setTickSize(Number.parseFloat(e.currentTarget.value))}
        type="number"
      />
    </label>
  </p>

  <label>
    Label tick width:
    <input
      value={conf.data.tickWidth}
      onchange={(e) => conf.setTickWidth(Number.parseFloat(e.currentTarget.value))}
      type="number"
    />
  </label>

  <p>
    <label>
      Auto ticks from
      <input
        value={conf.data.auto.from}
        onchange={(e) => conf.setAutoFrom(e.currentTarget.value)}
        style="width: 80px;"
      />
    </label>
    <label>
      every
      <input
        value={conf.data.auto.each}
        onchange={(e) => conf.setAutoEach(Number.parseFloat(e.currentTarget.value))}
        type="number"
        style="width: 80px;"
      />
    </label>
  </p>

  {#if !isMinor}
    <p>
      <label>
        Auto label
        <input
          checked={conf.data.auto.labels}
          onchange={(e) => conf.setAutoLabels(e.currentTarget.checked)}
          type="checkbox"
        />
      </label>

      <label>
        <select
          value={conf.data.labelDivide}
          onchange={(e) => conf.setLabelDivide(Number.parseFloat(e.currentTarget.value))}
          style="width: 80px;"
        >
          {#each [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000] as n (n)}
            <option>{n}</option>
          {/each}
        </select>
      </label>

      <label>
        after
        <input
          value={conf.data.afterLabel}
          onchange={(e) => conf.setAfterLabel(e.currentTarget.value)}
          style="width: 80px;"
        />
      </label>
    </p>

    <p>
      Manual marks
      <br />
      {#each conf.data.ticks as kv, i (i)}
        <label
          >Value <input
            value={kv.n}
            onchange={(e) => conf.setTickValue(i, Number.parseInt(e.currentTarget.value))}
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
