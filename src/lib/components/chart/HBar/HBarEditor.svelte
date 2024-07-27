<script lang="ts">
  /** eslint-disable @typescript-eslint/strict-boolean-expressions */
  import type {Root } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { group, orDefault } from "$lib/utils";
  import type { DSVParsedArray } from "d3-dsv";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { max } from "d3-array";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  export let spec: Root;
  export let chart: ReturnType<typeof db.chart>;
  export let dbHBar: ReturnType<ReturnType<typeof db.chart>["hBar"]>;
  export let chartData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: DSVParsedArray<any>;
  };

  const deleteColor = (i: number, ci: number) => {
    chart.removeColorScaleColor(i, ci);
  };
  const addColor = (i: number, ci: number) => {
    chart.addColorScaleColor(i, ci);
  };

  $: dataSet = spec.data.sets.find((set) => set.id == $dbHBar.dataSet);

  $: columns = [
    ...orDefault(dataSet?.rows, []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toKey, type: e.type })), []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toValue, type: e.type })), []),
  ];

  $: scaleIndex = spec.chart.scales.findIndex((s) => s.name == $dbHBar.scale);
  $: scale = typeof spec.chart.scales[scaleIndex] == "undefined" ? { dataRange: [0, 1] } : spec.chart.scales[scaleIndex];
  $: colorScaleIndex = spec.chart.scales.findIndex(
    (s) => s.type == "categoriesColor",
  );
  $: colorScale = spec.chart.scales[colorScaleIndex];

  $: groups = formatData($dbHBar, chartData, colorScale.colors?.byKey || []);
  $: {
    const computed = max(groups, (d) =>
      max(d.d, (dd) => max(dd.value, (ddd) => ddd.to)),
    );
    if (
      typeof computed == "number" &&
      !Number.isNaN(computed) &&
      computed != scale.dataRange?.[1]
    ) {
      chart.setScaleTo(scaleIndex, computed);
    }
  }

  $: unusedGroups = orDefault(groups[0]?.d[0]?.value, [])
    .map((d) => d.label)
    .filter((k) => colorScale.colors?.byKey.findIndex((c) => c.k == k) == -1);

  $: automateColorKeys = () => {
    if (typeof $dbHBar.dataSet != "undefined" && typeof chartData[$dbHBar.dataSet] != "undefined") {
      const key = typeof $dbHBar.subCategories != "undefined" ? $dbHBar.subCategories : $dbHBar.categories;
      const dataSet = chartData[$dbHBar.dataSet];
      const groups = group(key, dataSet, (k) => k);
      groups.forEach((k) => {
        if (
          !spec.chart.scales[colorScaleIndex].colors?.byKey.find(
            (d) => d.k == k,
          )
        ) {
          const n = spec.chart.scales[colorScaleIndex].colors?.byKey.length;
          const keyIndex =
            typeof n != "undefined" ? n : 0;
          chart.addColorScaleColor(colorScaleIndex, keyIndex, k, "#FF0000", k);
        }
      });
    }
  };

  $: removeExtraColorKeys = () => {
    if (typeof $dbHBar.dataSet != "undefined" && typeof chartData[$dbHBar.dataSet] != "undefined") {
      const key = typeof $dbHBar.subCategories != "undefined" ? $dbHBar.subCategories : $dbHBar.categories;
      const dataSet = chartData[$dbHBar.dataSet];
      const groups = group(key, dataSet, (k) => k);
      let removed = 0;
      spec.chart.scales[colorScaleIndex].colors?.byKey.forEach(
        (c, keyIndex) => {
          if (typeof groups.find((k) => c.k == k) != "undefined") {
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
        <option value={set.id}>{set.name}</option>
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
        {#each columns as column}
          <option>{column.key}</option>
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
        {#each columns as column}
          <option>{column.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label>
      Stack sub categories:
      <input
        checked={$dbHBar.stackSubCategories}
        on:change={(e) => dbHBar.setStackSubCategories(e.currentTarget.checked)}
        type="checkbox"
      >
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
        {#each columns.filter((r) => r.type == "number") as row}
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
  {#if colorScale.colors}
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
              on:click={() => moveColorKeyUp(i)}
              class="color-control-arrow">&#x25B2;</button
            >
            <button
              disabled={i == colorScale.colors.byKey.length - 1}
              on:click={() => moveColorKeyDown(i)}
              class="color-control-arrow">&#x25BC;</button
            >
          </td>
          <td>
            <select
              value={color.k}
              on:change={(e) =>
                chart.setColorScaleKey(
                  colorScaleIndex,
                  i,
                  e.currentTarget.value,
                )}
            >
              <option>{""}</option>
              {#if color.k}
                <option>{color.k}</option>
              {/if}
              {#each unusedGroups as k}
                <option>{k}</option>
              {/each}
            </select>
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
              chartColors={colorScale.colors.byKey.map(c => c.c)}
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
            <button on:click={() => deleteColor(colorScaleIndex, i)}>
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
  .color-control input, .color-control select {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control > td button {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control-arrow {
    width: 16px;
    border: 0px;
    background: none;
    margin: 0px;
    padding: 0px;
  }
</style>
