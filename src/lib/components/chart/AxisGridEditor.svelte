<script lang="ts">
  import type { axisGrid } from "$lib/chartStore";
  import ColorPicker from "./ColorPicker/ColorPicker.svelte";

  export let conf: ReturnType<typeof axisGrid>;
  export let isMinor = false;
</script>

<p>
  <label>
    Enabled:
    <input
      checked={$conf.enabled}
      on:change={e => conf.setEnabled(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
{#if $conf.enabled}
  <p>
    <label>
      Grid:
      <input
        checked={$conf.grid}
        on:change={e => conf.setGrid(e.currentTarget.checked)}
        type="checkbox"
      />
    </label>
  </p>

  <p>
    <label>
      Label tick size:
      <input
        value={$conf.tickSize}
        on:change={e => conf.setTickSize(Number.parseFloat(e.currentTarget.value))}
        type="number"
      />
    </label>
  </p>

  <p>
    Label tick color:
    <ColorPicker
      color={$conf.color}
      on:change={e => conf.setColor(e.detail)}
    />
  </p>

  <p>
    <label>
      Auto ticks from
      <input
        value={$conf.auto.from}
        on:change={e => conf.setAutoFrom(Number.parseFloat(e.currentTarget.value))}
        type="number"
        style="width: 80px;"
      />
    </label>
    <label>
      every
      <input
        value={$conf.auto.each}
        on:change={e => conf.setAutoEach(Number.parseFloat(e.currentTarget.value))}
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
          checked={$conf.auto.labels}
          on:change={e => conf.setAutoLabels(e.currentTarget.checked)}
          type="checkbox"
        />
      </label>

      <label>
        <select
          value={$conf.labelDivide}
          on:change={(e) => conf.setLabelDivide(Number.parseFloat(e.currentTarget.value))}
          style="width: 80px;"
        >
          {#each [1, 1000, 1000000, 1000000000] as n}
            <option>{n}</option>
          {/each}
        </select>
      </label>

      <label>
        after
        <input
          value={$conf.afterLabel}
          on:change={e => conf.setAfterLabel(e.currentTarget.value)}
          style="width: 80px;"
        />
      </label>
    </p>

    <p>
      Manual marks
      <br>
      {#each $conf.ticks as kv, i}
        <label>Value <input value={kv.n} on:change={(e) => conf.setTickValue(i, Number.parseInt(e.currentTarget.value))} type="number" style="width: 80px;" /></label>
        <label>Text <input value={kv.l} on:change={(e) => conf.setTickLabel(i, e.currentTarget.value)} type="text" style="width: 80px;" /></label>
        <button on:click={() => conf.removeTick(i)}>delete</button>
        <br>
      {/each}
      <button on:click={() => conf.addTick($conf.ticks.length)}>+ add</button>
    </p>
  {/if}
{/if}
