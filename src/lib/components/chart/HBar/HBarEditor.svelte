<script lang="ts">
  import type { Data, HBar, Root, Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { group } from "$lib/utils";
  import type { DSVParsedArray } from "d3-dsv";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { max } from "d3-array";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  export let spec: Root;
  export let chart: ReturnType<typeof db.chart>;
  export let dbHBar: ReturnType<ReturnType<typeof db.chart>["hBar"]>;
  export let chartData: {
    [key: string]: DSVParsedArray<any>;
  };

  const deleteColor = (i: number, ci: number) => {
    chart.removeColorScaleColor(i, ci);
  };
  const addColor = (i: number, ci: number) => {
    chart.addColorScaleColor(i, ci);
  };

  $: dataSet = spec.data.sets.find((set) => set.id == $dbHBar.dataSet);

  $: scaleIndex = spec.chart.scales.findIndex((s) => s.name == $dbHBar.scale);
  $: scale = spec.chart.scales[scaleIndex] || { dataRange: [0, 1] };
  $: colorScaleIndex = spec.chart.scales.findIndex(
    (s) => s.type == "categoriesColor",
  );
  $: colorScale = spec.chart.scales[colorScaleIndex];

  $: groups = formatData($dbHBar, chartData);
  $: {
    const computed = max(groups, (d) =>
      max(d.d, (dd) => max(dd.value, (ddd) => ddd.value)),
    );
    if (
      typeof computed == "number" &&
      !Number.isNaN(computed) &&
      computed != scale.dataRange?.[1]
    ) {
      chart.setScaleTo(scaleIndex, computed);
    }
  }

  $: automateColorKeys = () => {
    if ($dbHBar.dataSet && chartData[$dbHBar.dataSet]) {
      const key = $dbHBar.subCategories || $dbHBar.categories;
      const dataSet = chartData[$dbHBar.dataSet];
      const groups = group(key, dataSet, (k) => k);
      groups.forEach((k) => {
        if (
          !spec.chart.scales[colorScaleIndex].colors?.byKey.find(
            (d) => d.k == k,
          )
        ) {
          const keyIndex =
            spec.chart.scales[colorScaleIndex].colors?.byKey.length || 0;
          chart.addColorScaleColor(colorScaleIndex, keyIndex, k, "#FF0000", k);
        }
      });
    }
  };

  $: removeExtraColorKeys = () => {
    if ($dbHBar.dataSet && chartData[$dbHBar.dataSet]) {
      const key = $dbHBar.subCategories || $dbHBar.categories;
      const dataSet = chartData[$dbHBar.dataSet];
      const groups = group(key, dataSet, (k) => k);
      let removed = 0;
      spec.chart.scales[colorScaleIndex].colors?.byKey.forEach(
        (c, keyIndex) => {
          if (!groups.find((k) => c.k == k)) {
            chart.removeColorScaleColor(colorScaleIndex, keyIndex - removed);
            removed++;
          }
        },
      );
    }
  };

  $: moveColorKeyUp = (i: number) => {
    chart.moveColorUp(colorScaleIndex, i);
  };
  $: moveColorKeyDown = (i: number) => {
    chart.moveColorDown(colorScaleIndex, i);
  };
</script>

<p>
  <label>
    Data set:
    <select
      value={$dbHBar.dataSet}
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
      value={$dbHBar.labelWidth}
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
        value={$dbHBar.categories}
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
        value={$dbHBar.subCategories}
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
        value={$dbHBar.value}
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
      <tr><th></th><th>Key</th><th>Color</th><th></th><th>Label</th></tr>
      <tr>
        <td></td>
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
          <ColorPicker
            color={colorScale.colors.default}
            on:change={(e) =>
              chart.setColorScaleDefaultColor(colorScaleIndex, e.detail)}
          />
        </td>
        <td> </td>
        <td> </td>
      </tr>
      {#each colorScale.colors.byKey as color, i}
        <tr>
          <td style="width:38px;">
            <button
              disabled={i == 0}
              on:click={(e) => moveColorKeyUp(i)}
              class="color-control-arrow">&#x25B2;</button
            >
            <button
              disabled={i == colorScale.colors.byKey.length - 1}
              on:click={(e) => moveColorKeyDown(i)}
              class="color-control-arrow">&#x25BC;</button
            >
          </td>
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
            <ColorPicker
              color={color.c}
              on:change={(e) =>
                chart.setColorScaleColor(colorScaleIndex, i, e.detail)}
            />
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
    <button on:click={automateColorKeys}>Add missing data keys</button>
    <button on:click={removeExtraColorKeys}>Remove extra data keys</button>
  {/if}
  <p>
    <label
      >Repeat for each:
      <select
        value={$dbHBar.repeat}
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

<b>Axis</b>
<AxisEditor conf={dbHBar.axis()} showRepeatControl={$dbHBar.repeat != ""} />

<style>
  .color-control {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control input {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control > td button {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control .indicator {
    width: 1em;
    height: 1em;
    display: inline-block;
  }
  .color-control-arrow {
    width: 16px;
    border: 0px;
    background: none;
    margin: 0px;
    padding: 0px;
  }
</style>
