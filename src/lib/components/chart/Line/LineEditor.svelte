<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { type LineRepeatSettingsKey, type Root } from "$lib/chart";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { orDefault } from "$lib/utils";
  import LinesEditor from "./LinesEditor.svelte";
  import CategoryList from "../CategoryList.svelte";
  import PresenceField from "../PresenceField.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";
  import { LineStore } from "$lib/chartStores/line.svelte";
  import type { ComputedData } from "$lib/data";
  import { untrack } from "svelte";

  interface Props {
    spec: Root;
    chartData: ComputedData;
    index: number;
    id: string;
    connection: ShareDBConnection;
  }

  let { spec, chartData, index, connection, id }: Props = $props();

  let lineStore = untrack(() => new LineStore(connection, id));

  let dataSet = $derived(spec.data.sets.find((set) => set.id == lineStore.data.dataSet));

  let values = $derived(lineStore.data ? formatData(lineStore.data, chartData) : []);
  let columns = $derived(
    typeof dataSet != "undefined"
      ? [
          ...orDefault(
            dataSet.transpose?.map((e) => ({ key: e.toKey, type: e.keyType })),
            [],
          ),
          ...orDefault(
            dataSet.transpose?.map((e) => ({ key: e.toValue, type: e.valueType })),
            [],
          ),
          ...orDefault(dataSet?.rows, []),
        ]
      : [],
  );

  let chartColors = $derived(lineStore.data.style.byKey.map((s) => s.color));

  const updateRepeatSettings = () => {
    if (typeof lineStore.data == "undefined") {
      return;
    }
    const data = lineStore.data;
    if (typeof lineStore.data?.repeatSettings == "undefined") {
      lineStore.updateRepeatSettings(
        values.map((e) => e.k),
        undefined,
      );
    } else {
      values
        .map((e) => e.k)
        .filter((k) => data.repeatSettings.byKey.findIndex((e) => e.k == k) == -1)
        .forEach((k) => lineStore.addRepeatSetting(data.repeatSettings.byKey.length, k));
      // FIXME
      // chartSpec.removeRepeatSettings(
      //   lineStore.data.repeatSettings.byKey
      //     .map((e, i) => ({ i, e }))
      //     .filter((e) => values.findIndex((v) => v.k == e.e.k) == -1)
      //     .map((e) => e.i),
      // );
    }
  };

  let selectedIndexes: number[] = $state([]);
  const setRepeatedLabel = (value: string) => {
    selectedIndexes.forEach((i) => lineStore.repeatSetting(i).setLabel(value));
  };
  const setRepeatedOwnChart = (value: boolean) => {
    selectedIndexes.forEach((i) => lineStore.repeatSetting(i).setOwnChart(value));
  };
  const setRepeatedAllCharts = (value: boolean) => {
    selectedIndexes.forEach((i) => lineStore.repeatSetting(i).setAllCharts(value));
  };
</script>

<h3 class="editor-sub-section">General</h3>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="line-data-set">Data set</label>
  </div>
  <div>
    <PresenceField address={["chart", "elements", id, "d", "dataSet"]} {connection}>
      {#snippet field({ locked })}
        <select
          id="line-data-set"
          value={lineStore.data.dataSet}
          disabled={locked}
          onchange={(e) => lineStore.setDataSet(e.currentTarget.value)}
        >
          <option></option>
          {#each spec.data.sets as set (set.id)}
            <option value={set.id}>{set.name}</option>
          {/each}
        </select>
      {/snippet}
    </PresenceField>
  </div>
</div>

{#if dataSet}
  <div class="editor-row">
    <div class="editor-column-label">
      <label for="line-x-values">X values from:</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "x", "key"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="line-x-values"
            value={lineStore.data.x.key}
            disabled={locked}
            onchange={(e) => lineStore.setXKey(e.currentTarget.value)}
          >
            <option></option>
            {#each columns as row, i (i)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="line-y-values">Y values from:</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "y", "key"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="line-y-values"
            value={lineStore.data.y.key}
            disabled={locked}
            onchange={(e) => lineStore.setYKey(e.currentTarget.value)}
          >
            <option></option>
            {#each columns as row, i (i)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <h3 class="editor-sub-section">Categories</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="line-categories">Categories from:</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "categories"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="line-categories"
            value={lineStore.data.categories}
            disabled={locked}
            onchange={(e) => lineStore.setCategoriesKey(e.currentTarget.value)}
          >
            <option></option>
            {#each columns as row, i (i)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="line-height">Height</label> <span class="editor-label-hint">(% of width)</span>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "heightRatio"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="line-height"
            value={lineStore.data.heightRatio * 100}
            readonly={locked}
            onchange={(e) =>
              lineStore.setHeightRatio(Number.parseFloat(e.currentTarget.value) / 100)}
            type="number"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="line-fill">Fill</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "fill"]} {connection}>
        {#snippet field({ locked })}
          <input
            id="line-fill"
            bind:checked={lineStore.data.fill}
            disabled={locked}
            onchange={(e) => lineStore.setFill(e.currentTarget.checked)}
            type="checkbox"
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if lineStore.data.categories}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="line-stack">Stack</label>
      </div>
      <div>
        <PresenceField address={["chart", "elements", id, "d", "stack"]} {connection}>
          {#snippet field({ locked })}
            <input
              id="line-stack"
              bind:checked={lineStore.data.stack}
              disabled={locked}
              onchange={(e) => lineStore.setStack(e.currentTarget.checked)}
              type="checkbox"
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    <span class="editor-column-label">Line style</span>
    <LinesEditor {chartColors} {values} {index} {lineStore} />
  {/if}

  <h3 class="editor-sub-section">Small multiples</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="line-repeat-for-every">Repeat for every</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "repeat"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="line-repeat-for-every"
            value={lineStore.data.repeat}
            disabled={locked}
            onchange={(e) => {
              lineStore.setRepeatKey(e.currentTarget.value);
              updateRepeatSettings();
            }}
          >
            <option></option>
            {#each columns as row, i (i)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#if lineStore.data.repeat != ""}
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="line-repeat-columns">Columns</label>
      </div>
      <div>
        <PresenceField address={["chart", "elements", id, "d", "repeatColumns"]} {connection}>
          {#snippet field({ locked })}
            <input
              id="line-repeat-columns"
              value={lineStore.data.repeatColumns}
              readonly={locked}
              onchange={(e) => lineStore.setRepeatColumns(Number.parseInt(e.currentTarget.value))}
              onkeyup={(e) => lineStore.setRepeatColumns(Number.parseInt(e.currentTarget.value))}
              type="number"
            />
          {/snippet}
        </PresenceField>
      </div>
    </div>

    {#snippet repeatTitle(d: LineRepeatSettingsKey)}
      {d.k}
    {/snippet}
    <CategoryList
      values={(lineStore.data.repeatSettings?.byKey || []).map((e) => ({ k: e.k, d: e }))}
      onSelectedChanged={(selected, indexes) => (selectedIndexes = indexes)}
      searchFn={(str, d) => d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase())}
      title={repeatTitle}
      moveUp={(_k, i) => lineStore.moveRepeatUp(i)}
      moveDown={(_k, i) => lineStore.moveRepeatDown(i)}
      {connection}
      addressFor={(item) => ["chart", "elements", id, "d", "repeatSettings", "byKey", item.k]}
    />

    {#if selectedIndexes.length != 0}
      {@const selRepeatKey =
        selectedIndexes.length === 1
          ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]]?.k
          : undefined}
      <div class="editor-row">
        <div class="editor-column-label">
          <label for="line-repeat-label">Label</label>
        </div>
        <div>
          <PresenceField
            address={[
              "chart",
              "elements",
              id,
              "d",
              "repeatSettings",
              "byKey",
              selRepeatKey ?? "",
              "label",
            ]}
            connection={selRepeatKey ? connection : undefined}
          >
            {#snippet field({ locked })}
              <input
                id="line-repeat-label"
                value={selectedIndexes.length == 1
                  ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]].title ||
                    lineStore.data.repeatSettings.byKey[selectedIndexes[0]].k
                  : ""}
                readonly={locked}
                onkeyup={(e) => setRepeatedLabel(e.currentTarget.value)}
                type="text"
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-column-label">
          <label for="line-repeat-own-chart">Has own chart</label>
        </div>
        <div>
          <PresenceField
            address={[
              "chart",
              "elements",
              id,
              "d",
              "repeatSettings",
              "byKey",
              selRepeatKey ?? "",
              "repeatOwn",
            ]}
            connection={selRepeatKey ? connection : undefined}
          >
            {#snippet field({ locked })}
              <input
                id="line-repeat-own-chart"
                type="checkbox"
                checked={selectedIndexes.length == 1
                  ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]].ownChart
                  : false}
                disabled={locked}
                onchange={(e) => setRepeatedOwnChart(e.currentTarget.checked)}
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-column-label">
          <label for="line-repeat-all-charts">Show on all charts</label>
        </div>
        <div>
          <PresenceField
            address={[
              "chart",
              "elements",
              id,
              "d",
              "repeatSettings",
              "byKey",
              selRepeatKey ?? "",
              "allCharts",
            ]}
            connection={selRepeatKey ? connection : undefined}
          >
            {#snippet field({ locked })}
              <input
                id="line-repeat-all-charts"
                type="checkbox"
                checked={selectedIndexes.length == 1
                  ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]].allCharts
                  : false}
                disabled={locked}
                onchange={(e) => setRepeatedAllCharts(e.currentTarget.checked)}
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>
    {/if}
  {/if}
{/if}

<h3 class="editor-sub-section">Horizontal axis</h3>
<AxisEditor
  conf={lineStore.xAxis()}
  {connection}
  address={["chart", "elements", id, "d", "x", "axis"]}
  idPrefix="line-x-"
/>

<h3 class="editor-sub-section">Vertical axis</h3>
<AxisEditor
  conf={lineStore.yAxis()}
  {connection}
  address={["chart", "elements", id, "d", "y", "axis"]}
  idPrefix="line-y-"
/>
