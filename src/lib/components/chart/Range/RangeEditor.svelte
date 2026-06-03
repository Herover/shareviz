<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { type Color, type LineRepeatSettingsKey } from "$lib/chart";
  import { LineSymbol } from "$lib/chart";
  import { AxisStore } from "$lib/chartStores/axis.svelte";
  import { orNumber } from "$lib/utils";
  import type { categoryKeys, rangeCategoryKeys, RangeElement } from ".";
  import AxisEditor from "../AxisEditor.svelte";
  import CategoryList from "../CategoryList.svelte";
  import type { EditorComponentProps } from "../chartComponents";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import PresenceField from "../PresenceField.svelte";

  let { spec, chartSpec, chartData, connection, store, id }: EditorComponentProps<RangeElement> =
    $props();

  // Check if the data appears to have changed in a way where new range points have been added/removed
  const rangeCategoryValues = $derived(
    Object.keys(
      chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
        acc[d[chartSpec.pointLabel]] = true;
        return acc;
      }, {}) ?? {},
    ),
  );
  $effect(() => {
    if (
      rangeCategoryValues.sort().join() !=
      chartSpec.rangeCategoryKeys
        .map((d) => d.k)
        .sort()
        .join()
    ) {
      const newVal: rangeCategoryKeys[] = rangeCategoryValues.map((d) => ({
        color: chartSpec.rangeCategoryKeys.find((c) => c.k == d)?.color ?? {
          light: { c: "#000000", v: "#000000" },
        },
        k: d,
        label: {
          text: chartSpec.rangeCategoryKeys.find((c) => c.k == d)?.label.text ?? d,
        },
        symbol: LineSymbol.CIRCLE,
      }));
      store.submitOp([
        "rangeCategoryKeys",
        {
          r: 1,
          i: newVal,
        },
      ]);
    }
  });
  // Check if the data appears to have changed in a way where new range points have been added/removed
  const categoryValues = $derived(
    Object.keys(
      chartData[chartSpec.dataSet]?.data.reduce((acc, d) => {
        acc[d[chartSpec.categories]] = true;
        return acc;
      }, {}) ?? {},
    ),
  );
  $effect(() => {
    if (
      categoryValues.sort().join() !=
      chartSpec.categoryKeys
        .map((d) => d.k)
        .sort()
        .join()
    ) {
      const newVal: categoryKeys[] = categoryValues.map((d) => ({
        k: d,
        label: {
          text: chartSpec.categoryKeys.find((c) => c.k == d)?.label.text ?? d,
        },
        symbol: LineSymbol.CIRCLE,
      }));
      store.submitOp([
        "categoryKeys",
        {
          r: 1,
          i: newVal,
        },
      ]);
    }
  });
  const sortCategoryKeys = $derived(() => {
    const newVal: categoryKeys[] = categoryValues
      .map((d) => ({
        k: d,
        label: {
          text: chartSpec.categoryKeys.find((c) => c.k == d)?.label.text ?? d,
        },
        symbol: LineSymbol.CIRCLE,
      }))
      .sort((a, b) => {
        const av = chartData[chartSpec.dataSet]?.data.reduce(
          (acc, d) =>
            d[chartSpec.categories] == a.k ? acc + orNumber(d[chartSpec.pointValue], 0) : acc,
          0,
        );
        const bv = chartData[chartSpec.dataSet]?.data.reduce(
          (acc, d) =>
            d[chartSpec.categories] == b.k ? acc + orNumber(d[chartSpec.pointValue], 0) : acc,
          0,
        );
        return bv - av;
      });
    store.submitOp([
      "categoryKeys",
      {
        r: 1,
        i: newVal,
      },
    ]);
  });

  const movePointDown = (k: string, i: number): void => {
    store.submitOp(["rangeCategoryKeys", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };

  const movePointUp = (k: string, i: number): void => {
    store.submitOp(["rangeCategoryKeys", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };

  const setPointLabelText = (val: string) => {
    selectedPoints.forEach((n) => {
      store.submitOp([
        "rangeCategoryKeys",
        n,
        "label",
        "text",
        {
          r: 1,
          i: val,
        },
      ]);
    });
  };

  const setPointColor = (val: Color) => {
    selectedPoints.forEach((n) => {
      store.submitOp([
        "rangeCategoryKeys",
        n,
        "color",
        {
          r: 1,
          i: { light: val },
        },
      ]);
    });
  };

  const pointSearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };

  let selectedPoints: number[] = $state([]);
  const selectPoint = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedPoints = indexes;
  };

  const setDataSet = (v: string) =>
    store.submitOp([
      "dataSet",
      {
        r: 1,
        i: v,
      },
    ]);
  const setRepeat = (v: string) =>
    store.submitOp([
      "repeat",
      {
        r: 1,
        i: v,
      },
    ]);
  const setCategories = (v: string) =>
    store.submitOp([
      "categories",
      {
        r: 1,
        i: v,
      },
    ]);
  const setPointLabel = (v: string) =>
    store.submitOp([
      "pointLabel",
      {
        r: 1,
        i: v,
      },
    ]);
  const setPointValue = (v: string) =>
    store.submitOp([
      "pointValue",
      {
        r: 1,
        i: v,
      },
    ]);

  const lineSearch = (str: string, d: { k: string; d: unknown }): boolean => {
    return d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase());
  };

  let selectedLines: number[] = $state([]);
  const selectLine = (values: { [key: string]: boolean }, indexes: number[]) => {
    selectedLines = indexes;
  };
  const moveLineDown = (k: string, i: number): void => {
    store.submitOp(["categoryKeys", [i, { p: 0 }], [i + 1, { d: 0 }]]);
  };

  const moveLineUp = (k: string, i: number): void => {
    store.submitOp(["categoryKeys", [i - 1, { d: 0 }], [i, { p: 0 }]]);
  };
  const setLineLabelText = (val: string) => {
    selectedLines.forEach((n) => {
      store.submitOp([
        "categoryKeys",
        n,
        "label",
        "text",
        {
          r: 1,
          i: val,
        },
      ]);
    });
  };

  // Stable key of the singly-selected line/point, used for the shared presence address.
  let selLineKey = $derived(
    selectedLines.length === 1 ? chartSpec.categoryKeys[selectedLines[0]]?.k : undefined,
  );
  let selPointKey = $derived(
    selectedPoints.length === 1 ? chartSpec.rangeCategoryKeys[selectedPoints[0]]?.k : undefined,
  );
</script>

<h3 class="editor-sub-section">General</h3>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="range-data-set">Data set</label>
  </div>
  <div>
    <PresenceField address={["chart", "elements", id, "d", "dataSet"]} {connection}>
      {#snippet field({ locked })}
        <select
          id="range-data-set"
          value={chartSpec.dataSet}
          disabled={locked}
          onchange={(e) => setDataSet(e.currentTarget.value)}
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

{#if chartSpec.dataSet}
  <div class="editor-row">
    <div class="editor-column-label">
      <label for="range-line-for-every">One line for every</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "categories"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="range-line-for-every"
            value={chartSpec.categories}
            disabled={locked}
            onchange={(e) => setCategories(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <button
    disabled={chartSpec.pointLabel == "" || chartSpec.categories == ""}
    onclick={sortCategoryKeys}>Sort</button
  >

  {#snippet lineTitle(d: categoryKeys)}
    {d.k}
  {/snippet}
  <CategoryList
    moveDown={moveLineDown}
    moveUp={moveLineUp}
    onSelectedChanged={selectLine}
    searchFn={lineSearch}
    title={lineTitle}
    values={chartSpec.categoryKeys.map((d) => ({ k: d.k, d }))}
    {connection}
    addressFor={(item) => ["chart", "elements", id, "d", "categoryKeys", item.k]}
  />

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="range-line-label">Label</label>
    </div>
    <div>
      <PresenceField
        address={["chart", "elements", id, "d", "categoryKeys", selLineKey ?? ""]}
        connection={selLineKey ? connection : undefined}
      >
        {#snippet field({ locked })}
          <input
            id="range-line-label"
            type="text"
            value={selectedLines.length == 1
              ? (chartSpec.categoryKeys[selectedLines[0]]?.label.text ?? "")
              : ""}
            onkeyup={(e) => setLineLabelText(e.currentTarget.value)}
            disabled={selectedLines.length == 0 || locked}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="range-point-for-every">One point for every</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "pointLabel"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="range-point-for-every"
            value={chartSpec.pointLabel}
            disabled={locked}
            onchange={(e) => setPointLabel(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="range-point-value">Point value</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "pointValue"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="range-point-value"
            value={chartSpec.pointValue}
            disabled={locked}
            onchange={(e) => setPointValue(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  {#snippet pointTitle(d: LineRepeatSettingsKey)}
    {d.k}
  {/snippet}
  <CategoryList
    moveDown={movePointDown}
    moveUp={movePointUp}
    onSelectedChanged={selectPoint}
    searchFn={pointSearch}
    title={pointTitle}
    values={chartSpec.rangeCategoryKeys.map((d) => ({ k: d.k, d }))}
    {connection}
    addressFor={(item) => ["chart", "elements", id, "d", "rangeCategoryKeys", item.k]}
  />

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="range-point-label">Label</label>
    </div>
    <div>
      <PresenceField
        address={[
          "chart",
          "elements",
          id,
          "d",
          "rangeCategoryKeys",
          selPointKey ?? "",
          "pointLabelText",
        ]}
        connection={selPointKey ? connection : undefined}
      >
        {#snippet field({ locked })}
          <input
            id="range-point-label"
            type="text"
            value={selectedPoints.length == 1
              ? (chartSpec.rangeCategoryKeys[selectedPoints[0]]?.label.text ?? "")
              : ""}
            onkeyup={(e) => setPointLabelText(e.currentTarget.value)}
            disabled={selectedPoints.length == 0 || locked}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Color</span>
    </div>
    <div>
      <PresenceField
        address={[
          "chart",
          "elements",
          id,
          "d",
          "rangeCategoryKeys",
          selPointKey ?? "",
          "pointColor",
        ]}
        connection={selPointKey ? connection : undefined}
      >
        {#snippet field({ locked })}
          <ColorPicker
            color={selectedPoints.length == 1
              ? (chartSpec.rangeCategoryKeys[selectedPoints[0]]?.color.light.v ?? "")
              : ""}
            disabled={selectedPoints.length == 0 || locked}
            onchange={(e) => setPointColor(e)}
          />
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <label for="range-repeat-for-every">Repeat for every</label>
    </div>
    <div>
      <PresenceField address={["chart", "elements", id, "d", "repeat"]} {connection}>
        {#snippet field({ locked })}
          <select
            id="range-repeat-for-every"
            value={chartSpec.repeat}
            disabled={locked}
            onchange={(e) => setRepeat(e.currentTarget.value)}
          >
            <option></option>
            {#each chartData[chartSpec.dataSet].rows as row (row.key)}
              <option>{row.key}</option>
            {/each}
          </select>
        {/snippet}
      </PresenceField>
    </div>
  </div>

  <h3 class="editor-sub-section">Axis</h3>
  <AxisEditor
    conf={new AxisStore(connection, chartSpec.axis, [...store.pathPrefix(), "axis"])}
    {connection}
    address={["chart", "elements", id, "d", "axis"]}
    showRepeatControl={true}
    idPrefix="range-"
  />
{/if}
