<script lang="ts">
  /** eslint-disable @typescript-eslint/strict-boolean-expressions */
  import { HBarTotalLabelStyle, type Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import { group, orDefault } from "$lib/utils";
  import type { DSVParsedArray } from "d3-dsv";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { max } from "d3-array";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import { HBarStore } from "$lib/chartStores/hbar.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";

  interface Props {
    spec: Root;
    chart: ReturnType<typeof db.chart>;
    chartData: {
      [key: string]: DSVParsedArray<any>;
    };
    index: number;
    connection: ShareDBConnection;
  }

  let { spec, chart, chartData, index, connection }: Props = $props();

  let hbarStore = new HBarStore(connection, index);

  let chartSpec = chart.hBar(index);

  let dataSet = $derived(spec.data.sets.find((set) => set.id == hbarStore.data.dataSet));

  let columns = $derived([
    ...orDefault(
      dataSet?.transpose?.map((e) => ({ key: e.toKey, type: e.keyType })),
      [],
    ),
    ...orDefault(
      dataSet?.transpose?.map((e) => ({ key: e.toValue, type: e.valueType })),
      [],
    ),
    ...orDefault(dataSet?.rows, []),
  ]);

  let scale = $derived(chartSpec.scale());
  let colorScale = $state(chartSpec.colors());

  const deleteColor = (ci: number) => {
    colorScale.removeColorScaleColor(ci);
  };
  const addColor = (ci: number) => {
    colorScale.addColorScaleColor(ci);
  };

  let groups = $derived(formatData(hbarStore.data, chartData, [] /* $colorScale.byKey */));
  // FIXME: Having this as a $effect here means changes to data wont get detected, and it might
  // cause issues when there's multiple clients watching at the same time.
  $effect(() => {
    const computed = max(groups, (d) => max(d.d, (dd) => max(dd.value, (ddd) => ddd.to)));
    if (
      typeof computed == "number" &&
      !Number.isNaN(computed) &&
      computed != $scale.dataRange?.[1]
    ) {
      chartSpec.scale().setScaleTo(computed);
    }
  });

  let unusedGroups = $derived(
    orDefault(groups[0]?.d[0]?.value, [])
      .map((d) => d.label)
      .filter((k) => $colorScale.byKey.findIndex((c) => c.k == k) == -1),
  );
  let automateColorKeys = $derived(() => {
    if (
      typeof hbarStore.data.dataSet != "undefined" &&
      typeof chartData[hbarStore.data.dataSet] != "undefined"
    ) {
      const key =
        typeof hbarStore.data.subCategories != "undefined"
          ? hbarStore.data.subCategories
          : hbarStore.data.categories;
      const dataSet = chartData[hbarStore.data.dataSet];
      const groups = group(key, dataSet, (k) => k);
      groups.forEach((k) => {
        if (!$colorScale.byKey.find((d) => d.k == k)) {
          const n = $colorScale.byKey.length;
          const keyIndex = typeof n != "undefined" ? n : 0;
          colorScale.addColorScaleColor(
            keyIndex,
            k,
            // TODO: only use known "good" color schemes
            `lch(${25 + Math.random() * 50}% ${80 + Math.random() * 20} ${Math.random() * 360})`,
            k,
          );
        }
      });
    }
  });
  // $: if (hbarStore.data.categories != "" && hbarStore.data.subCategories != "") {
  //   automateColorKeys();
  // }

  let removeExtraColorKeys = $derived(() => {
    if (
      typeof hbarStore.data.dataSet != "undefined" &&
      typeof chartData[hbarStore.data.dataSet] != "undefined"
    ) {
      const key =
        typeof hbarStore.data.subCategories != "undefined"
          ? hbarStore.data.subCategories
          : hbarStore.data.categories;
      const dataSet = chartData[hbarStore.data.dataSet];
      const groups = group(key, dataSet, (k) => k);
      let removed = 0;
      $colorScale.byKey.forEach((c, keyIndex) => {
        if (typeof groups.find((k) => c.k == k) == "undefined") {
          colorScale.removeColorScaleColor(keyIndex - removed);
          removed++;
        }
      });
    }
  });

  let moveColorKeyUp = $derived((i: number) => {
    colorScale.moveColorUp(i);
  });
  let moveColorKeyDown = $derived((i: number) => {
    colorScale.moveColorDown(i);
  });

  let totalLabel = $state(hbarStore.data.totalLabels);
</script>

<p>
  <label>
    Data set:
    <select
      value={hbarStore.data.dataSet}
      onchange={(e) => hbarStore.setDataSet(e.currentTarget.value)}
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
      value={hbarStore.data.labelWidth}
      onkeyup={(e) => hbarStore.setLabelWidth(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => hbarStore.setLabelWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
    />
  </label>
</p>
{#if dataSet}
  <p>
    <label>
      Categories from:
      <select
        value={hbarStore.data.categories}
        onchange={(e) => hbarStore.setCategories(e.currentTarget.value)}
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
        value={hbarStore.data.subCategories}
        onchange={(e) => hbarStore.setSubCategories(e.currentTarget.value)}
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
        checked={hbarStore.data.stackSubCategories}
        onchange={(e) => hbarStore.setStackSubCategories(e.currentTarget.checked)}
        type="checkbox"
      />
    </label>
    {#if hbarStore.data.stackSubCategories}
      <label>
        Total:
        <input
          checked={hbarStore.data.portionSubCategories}
          onchange={(e) => hbarStore.setPortionSubCategories(e.currentTarget.checked)}
          type="checkbox"
        />
      </label>
    {/if}
  </p>
  <p>
    <label>
      Values from:
      <select
        value={hbarStore.data.value}
        onchange={(e) => hbarStore.setValue(e.currentTarget.value)}
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
        value={$scale.dataRange?.[0] ?? 0}
        onkeyup={(e) => scale.setScaleFrom(Number.parseInt(e.currentTarget.value))}
        onchange={(e) => scale.setScaleFrom(Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 90px"
      />
    </label>
    <label>
      to
      <input
        value={$scale.dataRange?.[1] ?? 1}
        onkeyup={(e) => scale.setScaleTo(Number.parseInt(e.currentTarget.value))}
        onchange={(e) => scale.setScaleTo(Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 90px"
      />
    </label>
  </p>
  <p>Colors</p>
  {#if colorScale}
    <table class="color-control">
      <thead>
        <tr><th></th><th>Key</th><th>Color</th><th></th><th>Label</th></tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td><input value={"default"} disabled /> </td>
          <td>
            <input
              value={$colorScale.default}
              onchange={(e) => colorScale.setColorScaleDefaultColor(e.currentTarget.value)}
              onkeyup={(e) => colorScale.setColorScaleDefaultColor(e.currentTarget.value)}
            />
          </td>
          <td>
            <ColorPicker
              color={$colorScale.default}
              onchange={(s) => colorScale.setColorScaleDefaultColor(s)}
            />
          </td>
          <td> </td>
          <td> </td>
        </tr>
        {#each $colorScale.byKey as color, i}
          <tr>
            <td style="width:38px;">
              <button
                disabled={i == 0}
                onclick={() => moveColorKeyUp(i)}
                class="color-control-arrow">&#x25B2;</button
              >
              <button
                disabled={i == $colorScale.byKey.length - 1}
                onclick={() => moveColorKeyDown(i)}
                class="color-control-arrow">&#x25BC;</button
              >
            </td>
            <td>
              <select
                value={color.k}
                onchange={(e) => colorScale.setColorScaleKey(i, e.currentTarget.value)}
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
                onchange={(e) => colorScale.setColorScaleColor(i, e.currentTarget.value)}
                onkeyup={(e) => colorScale.setColorScaleColor(i, e.currentTarget.value)}
              />
            </td>
            <td>
              <ColorPicker
                color={color.c}
                chartColors={$colorScale.byKey.map((c) => c.c)}
                onchange={(s) => colorScale.setColorScaleColor(i, s)}
              />
            </td>
            <td
              ><input
                value={color.legend}
                onchange={(e) => colorScale.setColorScaleLegend(i, e.currentTarget.value)}
                onkeyup={(e) => colorScale.setColorScaleLegend(i, e.currentTarget.value)}
              />
            </td>
            <td>
              <button onclick={() => deleteColor(i)}> Delete </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button onclick={() => addColor($colorScale.byKey.length)}>Add new</button>
    <button onclick={automateColorKeys}>Add missing data keys</button>
    <button onclick={removeExtraColorKeys}>Remove extra data keys</button>
  {/if}

  <div class="box p-top-1">
    <div class="w-05 editor-explain-box">
      <span class="editor-column-label">Rectangle labels</span>
    </div>
    <div class="w-05">
      <input
        checked={hbarStore.data.rectLabels}
        onchange={(e) => hbarStore.setRectLabels(e.currentTarget.checked)}
        type="checkbox"
      />
    </div>
  </div>

  <div class="box p-top-1">
    <div class="w-05 editor-explain-box">
      <span class="editor-column-label">Total labels</span>
    </div>
    <div class="w-05">
      {#each Object.values(HBarTotalLabelStyle) as location}
        <label>
          <input type="radio" value={location} bind:group={totalLabel} />
          {location}
        </label><br />
      {/each}
    </div>
  </div>

  <p>
    <label
      >Repeat for each:
      <select
        value={hbarStore.data.repeat}
        onchange={(e) => hbarStore.setRepeat(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
{/if}

<b>Axis</b>
<AxisEditor conf={chartSpec.axis()} showRepeatControl={hbarStore.data.repeat != ""} />

<style>
  .color-control {
    width: 100%;
    box-sizing: border-box;
  }
  .color-control input,
  .color-control select {
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
