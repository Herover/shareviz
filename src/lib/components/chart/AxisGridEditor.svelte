<script lang="ts">
  import type { axisGrid } from "$lib/chartStore";

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

{#if !isMinor}
  <p>
    <label>
      Label tick size:
      <input
        value={$conf.tickSize}
        on:change={e => conf.setTickSize(Number.parseInt(e.currentTarget.value))}
        type="number"
      />
    </label>
  </p>

  <p>
    <label>
      Auto ticks from
      <input
        value={$conf.auto.from}
        on:change={e => conf.setAutoFrom(Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 80px;"
      />
    </label>
    <label>
      every
      <input
        value={$conf.auto.each}
        on:change={e => conf.setAutoEach(Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 80px;"
      />
    </label>
  </p>
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
        on:change={(e) => conf.setLabelDivide(Number.parseInt(e.currentTarget.value))}
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
{/if}