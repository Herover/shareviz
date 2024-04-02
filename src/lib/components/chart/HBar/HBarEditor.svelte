<script lang="ts">
  import type { Root, Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";

  export let spec: Root;
  export let chart: ReturnType<typeof db.chart>;
  export let dbHBar: ReturnType<ReturnType<typeof db.chart>["hBar"]>;

  const deleteColor = (i: number, ci: number) => {
    chart.removeColorScaleColor(i, ci);
  };
  const addColor = (i: number, ci: number) => {
    chart.addColorScaleColor(i, ci);
  };

  $: dataSet = spec.data.sets.find((set) => set.id == spec.chart.hBar.dataSet);

  $: scaleIndex = spec.chart.scales.findIndex(
    (s) => s.name == spec.chart.hBar.scale,
  );
  $: scale = spec.chart.scales[scaleIndex] || { dataRange: [0, 1] };
  $: colorScaleIndex = spec.chart.scales.findIndex(
    (s) => s.type == "categoriesColor",
  );
  $: colorScale = spec.chart.scales[colorScaleIndex];
</script>

<p>
  <label>
    Data set:
    <select
      value={spec.chart.hBar.dataSet}
      on:change={(e) => dbHBar.setDataSet(e.currentTarget.value)}
    >
      <option>{""}</option>
      {#each spec.data.sets as set}
        <option>{set.id}</option>
      {/each}
    </select>
  </label>
</p>
<p>
  <label>
    Label width: <input
      value={spec.chart.hBar.labelWidth}
      on:keyup={(e) =>
        dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
    />
  </label>
</p>
{#if dataSet}
  <p>
    <label>
      Categories from:
      <select
        value={spec.chart.hBar.categories}
        on:change={(e) => dbHBar.setCategories(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each dataSet.rows as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label>
      Sub categories from:
      <select
        value={spec.chart.hBar.subCategories}
        on:change={(e) => dbHBar.setSubCategories(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each dataSet.rows as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label>
      Values from:
      <select
        value={spec.chart.hBar.value}
        on:change={(e) => dbHBar.setValue(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each dataSet.rows.filter((r) => r.type == "number") as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label
      >Scale from:
      <input
        value={scale.dataRange[0]}
        on:keyup={(e) =>
          chart.setScaleFrom(
            scaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        on:change={(e) =>
          chart.setScaleFrom(
            scaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        type="number"
        style="width: 90px"
      />
    </label>
    <label>
      to
      <input
        value={scale.dataRange[1]}
        on:keyup={(e) =>
          chart.setScaleTo(scaleIndex, Number.parseInt(e.currentTarget.value))}
        on:change={(e) =>
          chart.setScaleTo(scaleIndex, Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 90px"
      />
    </label>
  </p>
  <p>Colors</p>
  {#if colorScale && colorScale.colors}
    <table class="color-control">
      <tr><th>Key</th><th>Color</th><th></th><th>Label</th></tr>
      <tr>
        <td><input value={"default"} disabled /> </td>
        <td>
          <input
            value={colorScale.colors.default}
            on:change={(e) =>
              chart.setColorScaleDefaultColor(
                colorScaleIndex,
                e.currentTarget.value,
              )}
            on:keyup={(e) =>
              chart.setColorScaleDefaultColor(
                colorScaleIndex,
                e.currentTarget.value,
              )}
          />
        </td>
        <td>
          <div
            class="indicator"
            style:background-color={colorScale.colors.default}
          ></div>
        </td>
        <td> </td>
        <td> </td>
      </tr>
      {#each colorScale.colors.byKey as color, i}
        <tr>
          <td>
            <input
              value={color.k}
              on:change={(e) =>
                chart.setColorScaleKey(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
              on:keyup={(e) =>
                chart.setColorScaleKey(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
            />
          </td>
          <td>
            <input
              value={color.c}
              on:change={(e) =>
                chart.setColorScaleColor(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
              on:keyup={(e) =>
                chart.setColorScaleColor(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
            />
          </td>
          <td>
            <div class="indicator" style:background-color={color.c}></div>
          </td>
          <td
            ><input
              value={color.legend}
              on:change={(e) =>
                chart.setColorScaleLegend(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
              on:keyup={(e) =>
                chart.setColorScaleLegend(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
            />
          </td>
          <td>
            <button on:click={(e) => deleteColor(colorScaleIndex, i)}>
              Delete
            </button>
          </td>
        </tr>
      {/each}
    </table>
    <button
      on:click={() => addColor(colorScaleIndex, colorScale.colors.byKey.length)}
      >Add new</button
    >
  {/if}
  <p>
    <label
      >Repeat for each:
      <select
        value={spec.chart.hBar.repeat}
        on:change={(e) => dbHBar.setRepeat(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each dataSet.rows as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
{/if}

<style>
  .color-control {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control input {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control button {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control .indicator {
    width: 1em;
    height: 1em;
    display: inline-block;
  }
</style>
